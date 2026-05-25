using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// Analytics Controller — thống kê hệ thống và cá nhân.
    /// Route: api/v{version:apiVersion}/analytics
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analytics;

        public AnalyticsController(IAnalyticsService analytics)
        {
            _analytics = analytics;
        }

        /// <summary>
        /// Tổng quan hệ thống — public (không cần đăng nhập).
        /// Thông tin: total users, active today, total XP, average level.
        /// GET /api/v1/analytics/overview
        /// </summary>
        [HttpGet("overview")]
        public async Task<ActionResult<SystemOverviewDto>> GetOverview()
        {
            var overview = await _analytics.GetSystemOverviewAsync();
            return Ok(overview);
        }

        /// <summary>
        /// Thống kê cá nhân user đang đăng nhập.
        /// GET /api/v1/analytics/me
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserAnalyticsDto>> GetMyAnalytics()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? User.FindFirstValue("sub");

            if (!Guid.TryParse(userId, out var id))
                return Unauthorized();

            var analytics = await _analytics.GetUserAnalyticsAsync(id);
            return Ok(analytics);
        }

        /// <summary>
        /// Top các module được hoàn thành nhiều nhất — public.
        /// GET /api/v1/analytics/modules/popular?limit=10
        /// </summary>
        [HttpGet("modules/popular")]
        public async Task<ActionResult<IEnumerable<ModulePopularityDto>>> GetPopularModules(
            [FromQuery] int limit = 10)
        {
            var popularity = await _analytics.GetModulePopularityAsync(limit);
            return Ok(popularity);
        }
    }
}
