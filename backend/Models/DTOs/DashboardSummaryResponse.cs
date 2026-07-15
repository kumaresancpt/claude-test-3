namespace Backend.Models.DTOs;

public class DashboardSummaryResponse
{
    public int VisitorsToday { get; set; }
    public int ActiveVisitors { get; set; }
    public int PendingApprovals { get; set; }
    public int OverstayAlerts { get; set; }
}
