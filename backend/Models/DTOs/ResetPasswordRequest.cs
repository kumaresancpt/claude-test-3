namespace Backend.Models.DTOs;

public class ResetPasswordRequest
{
    public string? ResetToken { get; set; }

    public string? NewPassword { get; set; }

    public string? ConfirmPassword { get; set; }
}
