using Backend.Data;
using Backend.Models;
using Backend.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class DashboardService(AppDbContext db) : IDashboardService
{
    private static string FormatTime(DateTime? dt) =>
        dt.HasValue ? dt.Value.ToString("HH:mm") : "-";

    private static string MapStatus(VisitorStatus s) => s switch
    {
        VisitorStatus.CheckIn          => "Check in",
        VisitorStatus.Waiting          => "Waiting",
        VisitorStatus.CheckedOut       => "Checked Out",
        VisitorStatus.ExpiredPass      => "Expired Pass",
        VisitorStatus.PendingApproval  => "Pending Approval",
        _                              => s.ToString()
    };

    private static string MapBadge(BadgeStatus b) => b switch
    {
        BadgeStatus.QRGenerated  => "QR Generated",
        BadgeStatus.Pending      => "Pending",
        BadgeStatus.BadgePrinted => "Badge Printed",
        BadgeStatus.BadgeExpired => "Badge Expired",
        _                        => b.ToString()
    };

    public async Task<DashboardSummaryResponse> GetSummaryAsync(string role)
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var visitorsToday = await db.Visitors
            .Where(v => v.CheckInTime >= today && v.CheckInTime < tomorrow)
            .CountAsync();

        var activeVisitors = await db.Visitors
            .Where(v => v.Status == VisitorStatus.CheckIn)
            .CountAsync();

        var pendingApprovals = await db.Visitors
            .Where(v => v.Status == VisitorStatus.PendingApproval)
            .CountAsync();

        // Overstay: checked-in visitors whose check-in was > 8 hours ago with no check-out
        var overstayThreshold = DateTime.UtcNow.AddHours(-8);
        var overstayAlerts = role == "Admin"
            ? await db.Visitors
                .Where(v => v.Status == VisitorStatus.CheckIn && v.CheckInTime < overstayThreshold)
                .CountAsync()
            : 0;

        return new DashboardSummaryResponse
        {
            VisitorsToday = visitorsToday,
            ActiveVisitors = activeVisitors,
            PendingApprovals = pendingApprovals,
            OverstayAlerts = overstayAlerts
        };
    }

    public async Task<IReadOnlyList<VisitorTrendPoint>> GetVisitorTrendsAsync(int days)
    {
        var cutoff = DateTime.UtcNow.Date.AddDays(-(days - 1));

        var raw = await db.Visitors
            .Where(v => v.CheckInTime >= cutoff)
            .GroupBy(v => v.CheckInTime.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .OrderBy(x => x.Date)
            .ToListAsync();

        // Fill gaps so every day in the range has an entry
        return Enumerable.Range(0, days)
            .Select(i => cutoff.AddDays(i))
            .Select(date => new VisitorTrendPoint
            {
                Date = date.ToString("d MMM yy"),
                Count = raw.FirstOrDefault(r => r.Date == date)?.Count ?? 0
            })
            .ToList();
    }

    public async Task<IReadOnlyList<VisitPurposePoint>> GetVisitPurposesAsync()
    {
        return await db.Visitors
            .GroupBy(v => v.Purpose)
            .Select(g => new VisitPurposePoint
            {
                Purpose = g.Key.ToString(),
                Count = g.Count()
            })
            .OrderBy(x => x.Purpose)
            .ToListAsync();
    }

    public async Task<PagedResponse<RecentVisitorDto>> GetRecentVisitorsAsync(int page, int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var total = await db.Visitors.CountAsync();

        var items = await db.Visitors
            .OrderByDescending(v => v.CheckInTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(v => new RecentVisitorDto
            {
                Id           = v.Id,
                Name         = v.Name,
                Company      = v.Company,
                Host         = v.Host,
                Purpose      = v.Purpose.ToString(),
                CheckInTime  = FormatTime(v.CheckInTime),
                CheckOutTime = FormatTime(v.CheckOutTime),
                Status       = MapStatus(v.Status),
                Badge        = MapBadge(v.BadgeStatus)
            })
            .ToListAsync();

        return new PagedResponse<RecentVisitorDto>
        {
            Items        = items,
            Page         = page,
            PageSize     = pageSize,
            TotalRecords = total
        };
    }
}
