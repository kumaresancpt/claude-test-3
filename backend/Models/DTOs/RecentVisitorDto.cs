namespace Backend.Models.DTOs;

public class RecentVisitorDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Host { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public string CheckInTime { get; set; } = string.Empty;
    public string CheckOutTime { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Badge { get; set; } = string.Empty;
}
