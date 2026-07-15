namespace Backend.Models;

public class Visitor
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Host { get; set; } = string.Empty;
    public VisitPurpose Purpose { get; set; }
    public DateTime CheckInTime { get; set; }
    public DateTime? CheckOutTime { get; set; }
    public VisitorStatus Status { get; set; }
    public BadgeStatus BadgeStatus { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
