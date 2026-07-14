namespace Backend.Models.DTOs;

/// <summary>
/// Internal (service-layer) result of a login attempt. The controller translates this into the
/// exact wire contract (accessToken/role/redirectUrl or detail) and status code.
/// </summary>
public class LoginResult
{
    public bool Success { get; init; }
    public int StatusCode { get; init; }
    public string? Detail { get; init; }
    public string? AccessToken { get; init; }
    public string? Role { get; init; }
    public string? RedirectUrl { get; init; }
    public int ExpiryMinutes { get; init; }
}

public class ForgotPasswordResult
{
    public int StatusCode { get; init; }
    public string Detail { get; init; } = string.Empty;
}

public class VerifyOtpResult
{
    public bool Success { get; init; }
    public int StatusCode { get; init; }
    public string? Detail { get; init; }
    public string? ResetToken { get; init; }
}

public class ResetPasswordResult
{
    public bool Success { get; init; }
    public int StatusCode { get; init; }
    public string Detail { get; init; } = string.Empty;
}

public class SessionResult
{
    public bool Valid { get; init; }
    public int ExpiresInSeconds { get; init; }
    public string? RefreshedAccessToken { get; init; }
}
