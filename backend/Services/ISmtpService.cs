namespace Backend.Services;

/// <summary>
/// Abstraction over sending transactional emails. In production this would be backed by a real
/// SMTP/email-provider implementation (e.g. SendGrid, SES, Graph). See ConsoleSmtpService for the
/// current dev-only stand-in used until real SMTP settings are configured.
/// </summary>
public interface ISmtpService
{
    Task SendOtpEmailAsync(string toEmail, string otp);
}
