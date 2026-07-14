using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Backend.Data;
using Backend.Models;
using Backend.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class AuthService : IAuthService
{
    private const int BcryptWorkFactor = 12;
    private const int MaxFailedAttempts = 5;
    private static readonly TimeSpan FailureWindow = TimeSpan.FromMinutes(15);
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);
    private static readonly TimeSpan OtpValidity = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan ResetTokenValidity = TimeSpan.FromMinutes(10);
    private const int MaxOtpAttempts = 3;
    private const int PasswordHistoryLimit = 5;

    // At least 8 chars, one upper, one lower, one digit, one special character.
    private static readonly Regex PasswordPolicyRegex = new(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$",
        RegexOptions.Compiled);

    private readonly AppDbContext _dbContext;
    private readonly IJwtService _jwtService;
    private readonly IAuditLogService _auditLogService;
    private readonly ISmtpService _smtpService;
    private readonly IConfiguration _configuration;

    public AuthService(
        AppDbContext dbContext,
        IJwtService jwtService,
        IAuditLogService auditLogService,
        ISmtpService smtpService,
        IConfiguration configuration)
    {
        _dbContext = dbContext;
        _jwtService = jwtService;
        _auditLogService = auditLogService;
        _smtpService = smtpService;
        _configuration = configuration;
    }

    private int DefaultExpiryMinutes =>
        int.TryParse(_configuration["JwtSettings:ExpiryMinutes"], out var minutes) ? minutes : 30;

    private int KeepLoggedInExpiryMinutes =>
        int.TryParse(_configuration["JwtSettings:KeepLoggedInExpiryMinutes"], out var minutes) ? minutes : 60 * 24 * 7;

    public async Task<LoginResult> LoginAsync(LoginRequest request, string ipAddress, string userAgent)
    {
        var username = request.Username?.Trim() ?? string.Empty;
        var password = request.Password ?? string.Empty;

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            return new LoginResult
            {
                Success = false,
                StatusCode = 400,
                Detail = "Username and password are required."
            };
        }

        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Username == username);

        if (user == null)
        {
            // Do the same amount of work regardless, and return the same generic message, to avoid
            // leaking whether the username exists.
            BCrypt.Net.BCrypt.HashPassword("dummy-password-for-timing-parity", BcryptWorkFactor);
            await _auditLogService.LogAsync(username, ipAddress, userAgent, AuditEventType.LoginFailure, "Failure: unknown username");
            return InvalidCredentials();
        }

        var now = DateTime.UtcNow;
        if (user.LockoutUntil.HasValue && user.LockoutUntil.Value > now)
        {
            var minutesRemaining = Math.Max(1, (int)Math.Ceiling((user.LockoutUntil.Value - now).TotalMinutes));
            await _auditLogService.LogAsync(user.Username, ipAddress, userAgent, AuditEventType.AccountLockout,
                $"Failure: account locked, {minutesRemaining} minute(s) remaining");
            return new LoginResult
            {
                Success = false,
                StatusCode = 423,
                Detail = $"Account locked due to too many failed attempts. Try again in {minutesRemaining} minutes."
            };
        }

        var passwordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        var roleMismatch = !string.IsNullOrWhiteSpace(request.Role)
            && !string.Equals(request.Role, user.Role.ToString(), StringComparison.OrdinalIgnoreCase);

        if (!passwordValid || roleMismatch)
        {
            RegisterFailedAttempt(user, now);
            await _dbContext.SaveChangesAsync();

            if (user.LockoutUntil.HasValue && user.LockoutUntil.Value > now)
            {
                var minutesRemaining = Math.Max(1, (int)Math.Ceiling((user.LockoutUntil.Value - now).TotalMinutes));
                await _auditLogService.LogAsync(user.Username, ipAddress, userAgent, AuditEventType.AccountLockout,
                    $"Failure: locked after {user.FailedLoginCount} consecutive failed attempts");
                return new LoginResult
                {
                    Success = false,
                    StatusCode = 423,
                    Detail = $"Account locked due to too many failed attempts. Try again in {minutesRemaining} minutes."
                };
            }

            await _auditLogService.LogAsync(user.Username, ipAddress, userAgent, AuditEventType.LoginFailure,
                roleMismatch ? "Failure: role mismatch" : "Failure: invalid password");
            return InvalidCredentials();
        }

        // Success: reset failure tracking.
        user.FailedLoginCount = 0;
        user.FirstFailedAttemptAt = null;
        user.LockoutUntil = null;
        user.UpdatedAt = now;
        await _dbContext.SaveChangesAsync();

        var expiryMinutes = request.KeepLoggedIn ? KeepLoggedInExpiryMinutes : DefaultExpiryMinutes;
        var (token, _) = _jwtService.GenerateToken(user, expiryMinutes);
        var redirectUrl = RedirectUrlForRole(user.Role);

        await _auditLogService.LogAsync(user.Username, ipAddress, userAgent, AuditEventType.LoginSuccess, "Success");

        return new LoginResult
        {
            Success = true,
            StatusCode = 200,
            AccessToken = token,
            Role = user.Role.ToString(),
            RedirectUrl = redirectUrl,
            ExpiryMinutes = expiryMinutes
        };
    }

    public async Task LogoutAsync(string username, string ipAddress, string userAgent)
    {
        await _auditLogService.LogAsync(username, ipAddress, userAgent, AuditEventType.Logout, "Success");
    }

    public async Task<ForgotPasswordResult> ForgotPasswordAsync(ForgotPasswordRequest request, string ipAddress, string userAgent)
    {
        var email = request.Email?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(email))
        {
            return new ForgotPasswordResult { StatusCode = 400, Detail = "Email is required." };
        }

        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user != null)
        {
            var otp = GenerateNumericOtp(6);
            var otpEntry = new OtpEntry
            {
                Email = email,
                OtpHash = BCrypt.Net.BCrypt.HashPassword(otp, BcryptWorkFactor),
                ExpiresAt = DateTime.UtcNow.Add(OtpValidity),
                AttemptCount = 0,
                Used = false
            };
            _dbContext.OtpEntries.Add(otpEntry);
            await _dbContext.SaveChangesAsync();

            // NOTE: no real SMTP is configured yet -- ConsoleSmtpService logs the OTP instead of
            // emailing it. In production this would go out via a real ISmtpService implementation.
            await _smtpService.SendOtpEmailAsync(email, otp);

            await _auditLogService.LogAsync(user.Username, ipAddress, userAgent, AuditEventType.OtpRequested, "Success");
        }
        else
        {
            // Do not reveal whether the email exists; still return the generic response below.
            await _auditLogService.LogAsync(email, ipAddress, userAgent, AuditEventType.OtpRequested, "Failure: unknown email");
        }

        return new ForgotPasswordResult { StatusCode = 200, Detail = "OTP sent" };
    }

    public async Task<VerifyOtpResult> VerifyOtpAsync(VerifyOtpRequest request, string ipAddress, string userAgent)
    {
        var email = request.Email?.Trim() ?? string.Empty;
        var otp = request.Otp?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(otp))
        {
            return new VerifyOtpResult { Success = false, StatusCode = 400, Detail = "Email and OTP are required." };
        }

        var entry = await _dbContext.OtpEntries
            .Where(o => o.Email == email && !o.Used)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (entry == null || entry.ExpiresAt < DateTime.UtcNow)
        {
            await _auditLogService.LogAsync(email, ipAddress, userAgent, AuditEventType.OtpVerified, "Failure: invalid or expired OTP");
            return new VerifyOtpResult { Success = false, StatusCode = 400, Detail = "Invalid or expired OTP." };
        }

        if (entry.AttemptCount >= MaxOtpAttempts)
        {
            await _auditLogService.LogAsync(email, ipAddress, userAgent, AuditEventType.OtpVerified, "Failure: too many attempts");
            return new VerifyOtpResult { Success = false, StatusCode = 429, Detail = "Too many attempts, request a new OTP." };
        }

        var otpValid = BCrypt.Net.BCrypt.Verify(otp, entry.OtpHash);

        if (!otpValid)
        {
            entry.AttemptCount += 1;
            await _dbContext.SaveChangesAsync();

            if (entry.AttemptCount >= MaxOtpAttempts)
            {
                await _auditLogService.LogAsync(email, ipAddress, userAgent, AuditEventType.OtpVerified, "Failure: too many attempts");
                return new VerifyOtpResult { Success = false, StatusCode = 429, Detail = "Too many attempts, request a new OTP." };
            }

            await _auditLogService.LogAsync(email, ipAddress, userAgent, AuditEventType.OtpVerified, "Failure: incorrect OTP");
            return new VerifyOtpResult { Success = false, StatusCode = 400, Detail = "Invalid or expired OTP." };
        }

        entry.Used = true;
        var resetToken = GenerateOpaqueToken();
        entry.ResetToken = resetToken;
        entry.ResetTokenExpiresAt = DateTime.UtcNow.Add(ResetTokenValidity);
        entry.ResetTokenUsed = false;
        await _dbContext.SaveChangesAsync();

        await _auditLogService.LogAsync(email, ipAddress, userAgent, AuditEventType.OtpVerified, "Success");

        return new VerifyOtpResult { Success = true, StatusCode = 200, ResetToken = resetToken };
    }

    public async Task<ResetPasswordResult> ResetPasswordAsync(ResetPasswordRequest request, string ipAddress, string userAgent)
    {
        var resetToken = request.ResetToken ?? string.Empty;
        var newPassword = request.NewPassword ?? string.Empty;
        var confirmPassword = request.ConfirmPassword ?? string.Empty;

        if (string.IsNullOrWhiteSpace(resetToken) || string.IsNullOrWhiteSpace(newPassword) || string.IsNullOrWhiteSpace(confirmPassword))
        {
            return new ResetPasswordResult { Success = false, StatusCode = 400, Detail = "Reset token, new password and confirmation are required." };
        }

        if (!PasswordPolicyRegex.IsMatch(newPassword))
        {
            return new ResetPasswordResult
            {
                Success = false,
                StatusCode = 400,
                Detail = "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character."
            };
        }

        if (newPassword != confirmPassword)
        {
            return new ResetPasswordResult { Success = false, StatusCode = 400, Detail = "New password and confirmation do not match." };
        }

        var entry = await _dbContext.OtpEntries
            .Where(o => o.ResetToken == resetToken && !o.ResetTokenUsed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (entry == null || entry.ResetTokenExpiresAt == null || entry.ResetTokenExpiresAt.Value < DateTime.UtcNow)
        {
            return new ResetPasswordResult { Success = false, StatusCode = 400, Detail = "Invalid or expired reset token." };
        }

        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == entry.Email);
        if (user == null)
        {
            return new ResetPasswordResult { Success = false, StatusCode = 400, Detail = "Invalid or expired reset token." };
        }

        var history = DeserializePasswordHistory(user.PasswordHistoryJson);
        var previousHashes = new List<string> { user.PasswordHash };
        previousHashes.AddRange(history);

        if (previousHashes.Any(hash => BCrypt.Net.BCrypt.Verify(newPassword, hash)))
        {
            return new ResetPasswordResult
            {
                Success = false,
                StatusCode = 400,
                Detail = "New password cannot match any of your last 5 passwords."
            };
        }

        history.Insert(0, user.PasswordHash);
        if (history.Count > PasswordHistoryLimit)
        {
            history = history.Take(PasswordHistoryLimit).ToList();
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword, BcryptWorkFactor);
        user.PasswordHistoryJson = JsonSerializer.Serialize(history);
        user.SecurityStamp = Guid.NewGuid().ToString("N");
        user.UpdatedAt = DateTime.UtcNow;

        entry.ResetTokenUsed = true;

        await _dbContext.SaveChangesAsync();

        await _auditLogService.LogAsync(user.Username, ipAddress, userAgent, AuditEventType.PasswordReset, "Success");

        return new ResetPasswordResult { Success = true, StatusCode = 200, Detail = "Password reset successful" };
    }

    public Task<SessionResult> RefreshSessionAsync(ClaimsPrincipal principal)
    {
        var expiryMinutes = DefaultExpiryMinutes;

        var usernameClaim = principal.FindFirst(AppClaimTypes.Username)?.Value ?? "unknown";
        var idClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? principal.FindFirst("sub")?.Value;
        var roleClaim = principal.FindFirst(ClaimTypes.Role)?.Value;
        var stampClaim = principal.FindFirst(AppClaimTypes.SecurityStamp)?.Value;

        if (idClaim == null || !Guid.TryParse(idClaim, out var userId) || roleClaim == null || stampClaim == null)
        {
            return Task.FromResult(new SessionResult { Valid = false, ExpiresInSeconds = 0 });
        }

        if (!Enum.TryParse<UserRole>(roleClaim, out var role))
        {
            return Task.FromResult(new SessionResult { Valid = false, ExpiresInSeconds = 0 });
        }

        // Reissue a fresh token/cookie with a new full sliding window, using the claims already
        // proven valid by JWT bearer middleware (signature, expiry, and SecurityStamp match).
        var refreshedUser = new User
        {
            Id = userId,
            Username = usernameClaim,
            Role = role,
            SecurityStamp = stampClaim,
            PasswordHash = string.Empty,
            Email = string.Empty
        };

        var (token, _) = _jwtService.GenerateToken(refreshedUser, expiryMinutes);

        return Task.FromResult(new SessionResult
        {
            Valid = true,
            ExpiresInSeconds = expiryMinutes * 60,
            RefreshedAccessToken = token
        });
    }

    private static LoginResult InvalidCredentials() => new()
    {
        Success = false,
        StatusCode = 401,
        Detail = "Invalid username or password."
    };

    private static string RedirectUrlForRole(UserRole role) => role switch
    {
        UserRole.Admin => "/dashboard",
        UserRole.Receptionist => "/visitor-entry",
        UserRole.SecurityGuard => "/gate-entry",
        _ => "/"
    };

    private static void RegisterFailedAttempt(User user, DateTime now)
    {
        if (user.FirstFailedAttemptAt == null || now - user.FirstFailedAttemptAt.Value > FailureWindow)
        {
            user.FailedLoginCount = 1;
            user.FirstFailedAttemptAt = now;
        }
        else
        {
            user.FailedLoginCount += 1;
        }

        if (user.FailedLoginCount >= MaxFailedAttempts)
        {
            user.LockoutUntil = now.Add(LockoutDuration);
        }

        user.UpdatedAt = now;
    }

    private static string GenerateNumericOtp(int digits)
    {
        var max = (int)Math.Pow(10, digits);
        var value = RandomNumberGenerator.GetInt32(0, max);
        return value.ToString(new string('0', digits));
    }

    private static string GenerateOpaqueToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }

    private static List<string> DeserializePasswordHistory(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new List<string>();
        }

        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
        }
        catch (JsonException)
        {
            return new List<string>();
        }
    }
}
