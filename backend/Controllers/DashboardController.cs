using System.Security.Claims;
using Backend.Models.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    [HttpGet("summary")]
    [ProducesResponseType(typeof(DashboardSummaryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetSummary()
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        var summary = await dashboardService.GetSummaryAsync(role);
        return Ok(summary);
    }

    [HttpGet("visitor-trends")]
    [ProducesResponseType(typeof(IReadOnlyList<VisitorTrendPoint>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetVisitorTrends([FromQuery] int days = 7)
    {
        if (days < 1 || days > 90)
        {
            return BadRequest(new { detail = "days must be between 1 and 90." });
        }

        var trends = await dashboardService.GetVisitorTrendsAsync(days);
        return Ok(trends);
    }

    [HttpGet("visit-purposes")]
    [ProducesResponseType(typeof(IReadOnlyList<VisitPurposePoint>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetVisitPurposes()
    {
        var purposes = await dashboardService.GetVisitPurposesAsync();
        return Ok(purposes);
    }

    [HttpGet("recent-visitors")]
    [ProducesResponseType(typeof(PagedResponse<RecentVisitorDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetRecentVisitors(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (pageSize > 100)
        {
            return BadRequest(new { detail = "pageSize cannot exceed 100." });
        }

        var result = await dashboardService.GetRecentVisitorsAsync(page, pageSize);
        return Ok(result);
    }
}
