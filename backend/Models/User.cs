using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

/// <summary>
/// A user account. Passwords are NEVER stored or returned as plaintext -- only PasswordHash
/// (bcrypt, salt rounds 12) is persisted.
/// </summary>
public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }

    /// <summary>Consecutive failed login attempts within the current rolling 15-minute window (AC-04).</summary>
    public int FailedLoginCount { get; set; } = 0;

    /// <summary>Timestamp of the first failure in the current rolling window; used to decide when to reset the counter.</summary>
    public DateTime? FirstFailedAttemptAt { get; set; }

    /// <summary>When set and in the future, the account is locked (AC-04).</summary>
    public DateTime? LockoutUntil { get; set; }

    /// <summary>
    /// Bumped whenever a password reset (or other security-relevant event) should invalidate
    /// previously-issued JWTs. Included as a claim in every token and re-checked on every request.
    /// </summary>
    public string SecurityStamp { get; set; } = Guid.NewGuid().ToString("N");

    /// <summary>JSON-serialized array of the last (up to) 5 bcrypt password hashes, most recent first (AC-07).</summary>
    public string PasswordHistoryJson { get; set; } = "[]";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
