using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// Auth Controller — xử lý đăng ký, đăng nhập, profile.
    /// Kết hợp in-memory cache (StatelessAuthStrategy) + PostgreSQL persistence (ApplicationDbContext).
    /// Route: api/v{version:apiVersion}/concepts/auth
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/concepts/auth")]
    public class StatelessAuthController : ControllerBase
    {
        private readonly StatelessAuthStrategy _authStrategy;
        private readonly ApplicationDbContext _dbContext;

        public StatelessAuthController(StatelessAuthStrategy authStrategy, ApplicationDbContext dbContext)
        {
            _authStrategy = authStrategy;
            _dbContext = dbContext;
        }

        private static string HashPasswordSHA256(string password)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password + "algolens-salt"));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        /// <summary>
        /// Đăng ký tài khoản mới — lưu vào cả in-memory cache và PostgreSQL.
        /// POST /api/v1/concepts/auth/register
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<StatelessAuthResponse>> Register([FromBody] StatelessRegisterRequest request)
        {
            try
            {
                var response = _authStrategy.Register(request);

                // Persist to PostgreSQL
                var existingUser = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);
                if (existingUser == null)
                {
                    var passwordHash = HashPasswordSHA256(request.Password);
                    var dbUser = new User(request.Email, request.Username, passwordHash);
                    _dbContext.Users.Add(dbUser);
                    await _dbContext.SaveChangesAsync();
                }
                // Ensure response reflects DB role
                response.User.Role = "Student";

                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = "REGISTRATION_FAILED", message = ex.Message });
            }
        }

        /// <summary>
        /// Đăng nhập — xác thực in-memory + cập nhật LastLoginAt trong PostgreSQL.
        /// POST /api/v1/concepts/auth/login
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<StatelessAuthResponse>> Login([FromBody] StatelessLoginRequest request)
        {
            try
            {
                var response = _authStrategy.Login(request);

                // Sync from PostgreSQL — update LastLoginAt + override role/premium from DB
                var dbUser = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);
                if (dbUser != null)
                {
                    dbUser.RecordLogin();
                    await _dbContext.SaveChangesAsync();
                    // Override in-memory fields with DB truth
                    response.User.Role = dbUser.Role;
                    response.User.IsPremium = dbUser.IsPremium;
                    response.User.TotalXP = dbUser.TotalXP;
                    response.User.CurrentLevel = dbUser.CurrentLevel;
                }

                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = "LOGIN_FAILED", message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy Access Token mới từ Refresh Token.
        /// POST /api/v1/concepts/auth/refresh
        /// </summary>
        [HttpPost("refresh")]
        public ActionResult<StatelessAuthResponse> Refresh([FromBody] StatelessRefreshRequest request)
        {
            try
            {
                var response = _authStrategy.RefreshToken(request.RefreshToken);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = "REFRESH_FAILED", message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "USER_NOT_FOUND", message = ex.Message });
            }
        }

        /// <summary>
        /// Đăng xuất — thu hồi Refresh Token khỏi bộ nhớ.
        /// POST /api/v1/concepts/auth/logout
        /// </summary>
        [HttpPost("logout")]
        public IActionResult Logout([FromBody] StatelessRefreshRequest request)
        {
            _authStrategy.Logout(request.RefreshToken);
            return NoContent();
        }

        /// <summary>
        /// Lấy thông tin profile từ userId.
        /// GET /api/v1/concepts/auth/me?userId=...
        /// </summary>
        [HttpGet("me")]
        public ActionResult<StatelessUserDto> GetMe([FromQuery] string? userId)
        {
            try
            {
                var id = userId ?? "demo-user-001";
                var user = _authStrategy.GetProfile(id);
                return Ok(user);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "USER_NOT_FOUND", message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy tiến trình học tập của user.
        /// GET /api/v1/concepts/auth/progress?userId=...
        /// </summary>
        [HttpGet("progress")]
        public ActionResult<StatelessUserProgressDto> GetProgress([FromQuery] string? userId)
        {
            try
            {
                var id = userId ?? "demo-user-001";
                var progress = _authStrategy.GetUserProgress(id);
                return Ok(progress);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "USER_NOT_FOUND", message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật profile (username).
        /// PUT /api/v1/concepts/auth/profile
        /// </summary>
        [HttpPut("profile")]
        public ActionResult<StatelessUserDto> UpdateProfile([FromBody] StatelessUpdateProfileRequest request)
        {
            try
            {
                var id = request.UserId ?? "demo-user-001";
                var user = _authStrategy.UpdateProfile(id, request.Username);
                return Ok(user);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "USER_NOT_FOUND", message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = "UPDATE_FAILED", message = ex.Message });
            }
        }

        /// <summary>
        /// Cộng XP cho user — in-memory + PostgreSQL persistence.
        /// POST /api/v1/concepts/auth/award-xp
        /// </summary>
        [HttpPost("award-xp")]
        public async Task<ActionResult<StatelessUserDto>> AwardXP([FromBody] StatelessXpAwardRequest request)
        {
            try
            {
                var id = request.UserId ?? "demo-user-001";
                var user = _authStrategy.AwardXP(id, request.Amount, request.Reason);

                // Persist XP to PostgreSQL — find by email (in-memory ID is string, DB ID is Guid)
                var dbUser = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Email == user.Email);
                if (dbUser != null)
                {
                    dbUser.AwardXP(request.Amount);
                    dbUser.RecordActivity();
                    await _dbContext.SaveChangesAsync();
                }

                return Ok(user);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "USER_NOT_FOUND", message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = "INVALID_AMOUNT", message = ex.Message });
            }
        }

        /// <summary>
        /// Demo credentials info.
        /// GET /api/v1/concepts/auth/demo-credentials
        /// </summary>
        [HttpGet("demo-credentials")]
        public ActionResult<object> GetDemoCredentials()
        {
            return Ok(new
            {
                message = "Tài khoản demo để kiểm thử",
                email = "demo@algolens.dev",
                password = "Demo@2024",
                note = "Dữ liệu đăng ký được lưu vĩnh viễn vào PostgreSQL. In-memory cache tự khởi tạo lại khi restart."
            });
        }
    }
}
