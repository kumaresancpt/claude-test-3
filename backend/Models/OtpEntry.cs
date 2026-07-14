using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

/// <summary>
/// Tracks a one-time-password issued for the forgot-password flow (AC-06), plus the short-lived
/// reset token minted after successful OTP verification (AC-07). Only a bcrypt hash of the OTP is
/// ever stored, never the plaintext code.
/// </summary>
public class OtpEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string OtpHash { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    /// <summary>Number of wrong verification attempts made against this OTP (AC-06: locked out at 3).</summary>
    public int AttemptCount { get; set; } = 0;

    /// <summary>True once the OTP has been successfully verified (a used OTP cannot be verified again).</summary>
    public bool Used { get; set; } = false;

    /// <summary>Random opaque token minted after a successful OTP verification; required by reset-password.</summary>
    public string? ResetToken { get; set; }

    public DateTime? ResetTokenExpiresAt { get; set; }

    public bool ResetTokenUsed { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
