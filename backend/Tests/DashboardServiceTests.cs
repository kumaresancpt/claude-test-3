using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Backend.Tests;

public class DashboardServiceTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static Visitor MakeVisitor(
        VisitorStatus status = VisitorStatus.CheckIn,
        DateTime? checkIn = null,
        DateTime? checkOut = null,
        VisitPurpose purpose = VisitPurpose.Meeting,
        BadgeStatus badge = BadgeStatus.QRGenerated)
    {
        return new Visitor
        {
            Id = Guid.NewGuid(),
            Name = "Test Visitor",
            Company = "Acme",
            Host = "Some Host",
            Purpose = purpose,
            CheckInTime = checkIn ?? DateTime.UtcNow,
            CheckOutTime = checkOut,
            Status = status,
            BadgeStatus = badge,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    [Fact]
    public async Task GetSummary_CountsVisitorsToday()
    {
        await using var ctx = CreateContext();
        ctx.Visitors.AddRange(
            MakeVisitor(checkIn: DateTime.UtcNow),
            MakeVisitor(checkIn: DateTime.UtcNow.AddDays(-2)));  // yesterday — should not count
        await ctx.SaveChangesAsync();

        var svc = new DashboardService(ctx);
        var result = await svc.GetSummaryAsync("Admin");

        Assert.Equal(1, result.VisitorsToday);
    }

    [Fact]
    public async Task GetSummary_CountsActiveVisitors()
    {
        await using var ctx = CreateContext();
        ctx.Visitors.AddRange(
            MakeVisitor(status: VisitorStatus.CheckIn),
            MakeVisitor(status: VisitorStatus.CheckIn),
            MakeVisitor(status: VisitorStatus.CheckedOut));
        await ctx.SaveChangesAsync();

        var svc = new DashboardService(ctx);
        var result = await svc.GetSummaryAsync("Admin");

        Assert.Equal(2, result.ActiveVisitors);
    }

    [Fact]
    public async Task GetSummary_CountsPendingApprovals()
    {
        await using var ctx = CreateContext();
        ctx.Visitors.AddRange(
            MakeVisitor(status: VisitorStatus.PendingApproval),
            MakeVisitor(status: VisitorStatus.CheckIn));
        await ctx.SaveChangesAsync();

        var svc = new DashboardService(ctx);
        var result = await svc.GetSummaryAsync("Admin");

        Assert.Equal(1, result.PendingApprovals);
    }

    [Fact]
    public async Task GetSummary_OverstayAlerts_HiddenForNonAdmin()
    {
        await using var ctx = CreateContext();
        ctx.Visitors.Add(MakeVisitor(
            status: VisitorStatus.CheckIn,
            checkIn: DateTime.UtcNow.AddHours(-9)));  // overstay
        await ctx.SaveChangesAsync();

        var svc = new DashboardService(ctx);

        var adminResult = await svc.GetSummaryAsync("Admin");
        var receptionistResult = await svc.GetSummaryAsync("Receptionist");

        Assert.Equal(1, adminResult.OverstayAlerts);
        Assert.Equal(0, receptionistResult.OverstayAlerts);
    }

    [Fact]
    public async Task GetVisitorTrends_ReturnsDayCount_WithGapFilling()
    {
        await using var ctx = CreateContext();
        var today = DateTime.UtcNow.Date;
        ctx.Visitors.AddRange(
            MakeVisitor(checkIn: today.AddDays(-1).AddHours(9)),
            MakeVisitor(checkIn: today.AddDays(-1).AddHours(11)),
            MakeVisitor(checkIn: today.AddHours(10)));
        await ctx.SaveChangesAsync();

        var svc = new DashboardService(ctx);
        var result = await svc.GetVisitorTrendsAsync(7);

        Assert.Equal(7, result.Count);
        // the last point is today
        Assert.Equal(1, result[^1].Count);
        // 6 days ago → no visitors
        Assert.Equal(0, result[0].Count);
    }

    [Fact]
    public async Task GetVisitPurposes_GroupsByPurpose()
    {
        await using var ctx = CreateContext();
        ctx.Visitors.AddRange(
            MakeVisitor(purpose: VisitPurpose.Meeting),
            MakeVisitor(purpose: VisitPurpose.Meeting),
            MakeVisitor(purpose: VisitPurpose.Delivery));
        await ctx.SaveChangesAsync();

        var svc = new DashboardService(ctx);
        var result = await svc.GetVisitPurposesAsync();

        var meetingEntry = result.FirstOrDefault(r => r.Purpose == "Meeting");
        var deliveryEntry = result.FirstOrDefault(r => r.Purpose == "Delivery");

        Assert.NotNull(meetingEntry);
        Assert.Equal(2, meetingEntry.Count);
        Assert.NotNull(deliveryEntry);
        Assert.Equal(1, deliveryEntry.Count);
    }

    [Fact]
    public async Task GetRecentVisitors_ReturnsPagedResults()
    {
        await using var ctx = CreateContext();
        for (int i = 0; i < 15; i++)
        {
            ctx.Visitors.Add(MakeVisitor(checkIn: DateTime.UtcNow.AddMinutes(-i)));
        }
        await ctx.SaveChangesAsync();

        var svc = new DashboardService(ctx);
        var result = await svc.GetRecentVisitorsAsync(page: 1, pageSize: 10);

        Assert.Equal(10, result.Items.Count);
        Assert.Equal(15, result.TotalRecords);
        Assert.Equal(2, result.TotalPages);
    }

    [Fact]
    public async Task GetRecentVisitors_MapsStatusAndBadgeToDisplayStrings()
    {
        await using var ctx = CreateContext();
        ctx.Visitors.Add(MakeVisitor(
            status: VisitorStatus.PendingApproval,
            badge: BadgeStatus.BadgePrinted));
        await ctx.SaveChangesAsync();

        var svc = new DashboardService(ctx);
        var result = await svc.GetRecentVisitorsAsync(1, 10);

        Assert.Equal("Pending Approval", result.Items[0].Status);
        Assert.Equal("Badge Printed", result.Items[0].Badge);
    }
}
