using Backend.Models;

namespace Backend.Services;

public interface IAuditLogService
{
    /// <summary>Writes one immutable audit row. There is intentionally no update/delete method (AC-09).</summary>
    Task LogAsync(string username, string ipAddress, string userAgent, AuditEventType eventType, string result);
}
