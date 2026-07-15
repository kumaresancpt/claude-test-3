using Backend.Models.DTOs;

namespace Backend.Services;

public interface IDashboardService
{
    Task<DashboardSummaryResponse> GetSummaryAsync(string role);
    Task<IReadOnlyList<VisitorTrendPoint>> GetVisitorTrendsAsync(int days);
    Task<IReadOnlyList<VisitPurposePoint>> GetVisitPurposesAsync();
    Task<PagedResponse<RecentVisitorDto>> GetRecentVisitorsAsync(int page, int pageSize);
}
