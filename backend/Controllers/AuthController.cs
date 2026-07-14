using Backend.Models.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private const string AccessTokenCookieName = "accessToken";

    private readonly IAuthService _authService;
    private readonly IAuditLogService _auditLogService;

    public AuthController(IAuthService authService, IAuditLogService auditLogService)
    {
        _authService = authService;
        _auditLogService = auditLogService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request, ClientIpAddress(), ClientUserAgent());

        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { detail = result.Detail });
        }

        SetAccessTokenCookie(result.AccessToken!, result.ExpiryMinutes);

        return Ok(new
        {
            accessToken = result.AccessToken,
            role = result.Role,
            redirectUrl = result.RedirectUrl
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var username = User.FindFirst(AppClaimTypes.Username)?.Value
            ?? User.Identity?.Name
            ?? "unknown";

        await _authService.LogoutAsync(username, ClientIpAddress(), ClientUserAgent());

        Response.Cookies.Delete(AccessTokenCookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/"
        });

        return Ok(new { });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var result = await _authService.ForgotPasswordAsync(request, ClientIpAddress(), ClientUserAgent());
        return StatusCode(result.StatusCode, new { detail = result.Detail });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var result = await _authService.VerifyOtpAsync(request, ClientIpAddress(), ClientUserAgent());

        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { detail = result.Detail });
        }

        return Ok(new { resetToken = result.ResetToken });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var result = await _authService.ResetPasswordAsync(request, ClientIpAddress(), ClientUserAgent());

        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { detail = result.Detail });
        }

        return Ok(new { detail = result.Detail });
    }

    [Authorize]
    [HttpGet("session")]
    public async Task<IActionResult> Session()
    {
        var result = await _authService.RefreshSessionAsync(User);

        if (!result.Valid)
        {
            return Unauthorized(new { detail = "Session is not valid." });
        }

        if (!string.IsNullOrEmpty(result.RefreshedAccessToken))
        {
            var expiryMinutes = Math.Max(1, result.ExpiresInSeconds / 60);
            SetAccessTokenCookie(result.RefreshedAccessToken, expiryMinutes);
        }

        return Ok(new { valid = true, expiresInSeconds = result.ExpiresInSeconds });
    }

    private void SetAccessTokenCookie(string token, int expiryMinutes)
    {
        Response.Cookies.Append(AccessTokenCookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTimeOffset.UtcNow.AddMinutes(expiryMinutes),
            Path = "/"
        });
    }

    private string ClientIpAddress() => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

    private string ClientUserAgent() => Request.Headers.UserAgent.ToString() is { Length: > 0 } ua ? ua : "unknown";
}
