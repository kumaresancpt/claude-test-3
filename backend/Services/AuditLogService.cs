using Backend.Data;
using Backend.Models;

namespace Backend.Services;

public class AuditLogService : IAuditLogService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<AuditLogService> _logger;

    public AuditLogService(AppDbContext dbContext, ILogger<AuditLogService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task LogAsync(string username, string ipAddress, string userAgent, AuditEventType eventType, string result)
    {
        var entry = new AuditLogEntry
        {
            Timestamp = DateTime.UtcNow,
            Username = string.IsNullOrWhiteSpace(username) ? "unknown" : username,
            IpAddress = string.IsNullOrWhiteSpace(ipAddress) ? "unknown" : ipAddress,
            UserAgent = string.IsNullOrWhiteSpace(userAgent) ? "unknown" : userAgent,
            EventType = eventType,
            Result = result
        };

        _dbContext.AuditLogEntries.Add(entry);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Audit: {EventType} for {Username} from {IpAddress} -> {Result}", eventType, entry.Username, entry.IpAddress, result);
    }
}
