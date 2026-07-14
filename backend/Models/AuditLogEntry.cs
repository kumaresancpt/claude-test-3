using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

/// <summary>
/// An immutable audit trail row (AC-09). There is intentionally no endpoint or service method that
/// updates or deletes rows in this table -- it is write-only from the application's perspective.
/// </summary>
public class AuditLogEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(64)]
    public string IpAddress { get; set; } = string.Empty;

    [Required]
    [MaxLength(512)]
    public string UserAgent { get; set; } = string.Empty;

    [Required]
    public AuditEventType EventType { get; set; }

    /// <summary>e.g. "Success" or "Failure: invalid password".</summary>
    [Required]
    [MaxLength(512)]
    public string Result { get; set; } = string.Empty;
}
