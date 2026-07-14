namespace Backend.Services;

/// <summary>
/// NOTE: No real SMTP provider is configured yet. In production this would send an actual email
/// via ISmtpService backed by SMTP/SendGrid/SES etc. For now we log the OTP to the console/logs
/// so the flow is testable end-to-end without a mail server.
/// </summary>
public class ConsoleSmtpService : ISmtpService
{
    private readonly ILogger<ConsoleSmtpService> _logger;

    public ConsoleSmtpService(ILogger<ConsoleSmtpService> logger)
    {
        _logger = logger;
    }

    public Task SendOtpEmailAsync(string toEmail, string otp)
    {
        // In production: would be emailed via a real ISmtpService implementation.
        _logger.LogInformation("[DEV-ONLY] Password reset OTP for {Email} is {Otp} (expires in 10 minutes)", toEmail, otp);
        Console.WriteLine($"[DEV-ONLY OTP EMAIL] To: {toEmail} | OTP: {otp} | (would be sent via SMTP in production)");
        return Task.CompletedTask;
    }
}
