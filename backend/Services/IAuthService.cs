using System.Security.Claims;
using Backend.Models.DTOs;

namespace Backend.Services;

public interface IAuthService
{
    Task<LoginResult> LoginAsync(LoginRequest request, string ipAddress, string userAgent);

    Task LogoutAsync(string username, string ipAddress, string userAgent);

    Task<ForgotPasswordResult> ForgotPasswordAsync(ForgotPasswordRequest request, string ipAddress, string userAgent);

    Task<VerifyOtpResult> VerifyOtpAsync(VerifyOtpRequest request, string ipAddress, string userAgent);

    Task<ResetPasswordResult> ResetPasswordAsync(ResetPasswordRequest request, string ipAddress, string userAgent);

    /// <summary>
    /// Given the ClaimsPrincipal of an already-validated (signature/expiry/security-stamp) token,
    /// computes remaining lifetime and mints a refreshed token with a new sliding expiry window.
    /// </summary>
    Task<SessionResult> RefreshSessionAsync(ClaimsPrincipal principal);
}
