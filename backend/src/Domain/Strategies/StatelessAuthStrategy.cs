using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using VisualizationDSA.Domain.Engine;

namespace VisualizationDSA.Domain.Strategies
{
    /// <summary>
    /// Stateless (in-memory) Authentication Strategy — không cần PostgreSQL.
    /// Quản lý user registration, login, profile, và mock JWT token generation.
    /// Singleton — dữ liệu tồn tại trong bộ nhớ suốt vòng đời ứng dụng.
    /// </summary>
    public class StatelessAuthStrategy
    {
        private readonly ConcurrentDictionary<string, InMemoryUser> _usersByEmail = new();
        private readonly ConcurrentDictionary<string, InMemoryUser> _usersById = new();
        private readonly ConcurrentDictionary<string, string> _refreshTokens = new(); // token → userId
        private static readonly TimeSpan AccessTokenLifetime = TimeSpan.FromMinutes(15);

        public StatelessAuthStrategy()
        {
            var demoUser = new InMemoryUser
            {
                Id = "demo-user-001",
                Email = "demo@algolens.dev",
                Username = "AlgoLens Student",
                PasswordHash = HashPassword("Demo@2024"),
                TotalXP = 150,
                CurrentLevel = 2,
                StreakDays = 3,
                IsPremium = false,
                Role = "Teacher",
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                LastLoginAt = DateTime.UtcNow.AddHours(-2),
                Badges = new List<InMemoryBadge>
                {
                    new() { Id = "first-steps", Name = "Bước Đầu Tiên", Description = "Hoàn thành bài học đầu tiên", Icon = "🎯", Color = "#10B981", EarnedAt = DateTime.UtcNow.AddDays(-25) },
                }
            };
            _usersByEmail[demoUser.Email] = demoUser;
            _usersById[demoUser.Id] = demoUser;
        }

        public StatelessAuthResponse Register(StatelessRegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                throw new ArgumentException("Email, username và password không được để trống.");

            if (request.Password.Length < 8)
                throw new ArgumentException("Mật khẩu phải có ít nhất 8 ký tự.");

            if (_usersByEmail.ContainsKey(request.Email))
                throw new ArgumentException("Email này đã được sử dụng bởi tài khoản khác.");

            if (_usersByEmail.Values.Any(u => u.Username == request.Username))
                throw new ArgumentException("Username này đã được sử dụng bởi tài khoản khác.");

            var user = new InMemoryUser
            {
                Id = $"user-{Guid.NewGuid():N}",
                Email = request.Email,
                Username = request.Username,
                PasswordHash = HashPassword(request.Password),
                TotalXP = 0,
                CurrentLevel = 1,
                StreakDays = 0,
                IsPremium = false,
                Role = "Student",
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow,
                Badges = new List<InMemoryBadge>()
            };

            _usersByEmail[user.Email] = user;
            _usersById[user.Id] = user;

            return GenerateAuthResponse(user);
        }

        public StatelessAuthResponse Login(StatelessLoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

            if (!_usersByEmail.TryGetValue(request.Email, out var user))
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

            if (!VerifyPassword(request.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

            user.LastLoginAt = DateTime.UtcNow;
            return GenerateAuthResponse(user);
        }

        public StatelessUserDto GetProfile(string userId)
        {
            if (!_usersById.TryGetValue(userId, out var user))
                throw new KeyNotFoundException("Người dùng không tồn tại.");
            return MapToUserDto(user);
        }

        public StatelessAuthResponse RefreshToken(string refreshTokenValue)
        {
            if (!_refreshTokens.TryGetValue(refreshTokenValue, out var userId))
                throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn.");

            if (!_usersById.TryGetValue(userId, out var user))
                throw new KeyNotFoundException("Người dùng không tồn tại.");

            _refreshTokens.TryRemove(refreshTokenValue, out _);
            return GenerateAuthResponse(user);
        }

        public void Logout(string refreshTokenValue)
        {
            _refreshTokens.TryRemove(refreshTokenValue, out _);
        }

        public StatelessUserDto UpdateProfile(string userId, string? newUsername)
        {
            if (!_usersById.TryGetValue(userId, out var user))
                throw new KeyNotFoundException("Người dùng không tồn tại.");

            if (!string.IsNullOrWhiteSpace(newUsername))
            {
                if (_usersByEmail.Values.Any(u => u.Username == newUsername && u.Id != userId))
                    throw new ArgumentException("Username này đã được sử dụng.");
                user.Username = newUsername;
            }
            return MapToUserDto(user);
        }

        public StatelessUserProgressDto GetUserProgress(string userId)
        {
            if (!_usersById.TryGetValue(userId, out var user))
                throw new KeyNotFoundException("Người dùng không tồn tại.");

            var levelThresholds = new[] { 0, 100, 300, 600, 1000, 1500, 2200, 3000 };
            var currentIdx = Math.Min(user.CurrentLevel - 1, levelThresholds.Length - 1);
            var nextIdx = Math.Min(user.CurrentLevel, levelThresholds.Length - 1);
            var currentThreshold = levelThresholds[currentIdx];
            var nextThreshold = levelThresholds[nextIdx];
            var xpInLevel = user.TotalXP - currentThreshold;
            var xpForLevel = nextThreshold - currentThreshold;
            var progressPercent = xpForLevel > 0 ? Math.Min(100, (int)(xpInLevel * 100.0 / xpForLevel)) : 100;

            return new StatelessUserProgressDto
            {
                TotalXP = user.TotalXP,
                CurrentLevel = user.CurrentLevel,
                XpToNextLevel = Math.Max(0, nextThreshold - user.TotalXP),
                LevelProgressPercent = progressPercent,
                BadgesEarned = user.Badges.Count,
                ModulesCompleted = user.CompletedModules.Count,
                CurrentStreak = user.StreakDays,
                CompletedModuleIds = user.CompletedModules.ToList(),
                Badges = user.Badges.Select(MapToBadgeDto).ToList(),
                IsPremium = user.IsPremium
            };
        }

        public StatelessUserDto AwardXP(string userId, int amount, string reason)
        {
            if (!_usersById.TryGetValue(userId, out var user))
                throw new KeyNotFoundException("Người dùng không tồn tại.");

            if (amount <= 0)
                throw new ArgumentException("Số XP phải lớn hơn 0.");

            user.TotalXP += amount;
            CheckLevelUp(user);

            return MapToUserDto(user);
        }

        // ── Helpers ──────────────────────────────────────────────────────

        private StatelessAuthResponse GenerateAuthResponse(InMemoryUser user)
        {
            var accessToken = GenerateMockJwt(user);
            var refreshToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
            _refreshTokens[refreshToken] = user.Id;

            return new StatelessAuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresIn = (int)AccessTokenLifetime.TotalSeconds,
                User = MapToUserDto(user)
            };
        }

        private static string GenerateMockJwt(InMemoryUser user)
        {
            var header = Convert.ToBase64String(Encoding.UTF8.GetBytes("{\"alg\":\"HS256\",\"typ\":\"JWT\"}"));
            var payload = Convert.ToBase64String(Encoding.UTF8.GetBytes(
                $"{{\"sub\":\"{user.Id}\",\"email\":\"{user.Email}\",\"name\":\"{user.Username}\"," +
                $"\"level\":{user.CurrentLevel},\"exp\":{DateTimeOffset.UtcNow.Add(AccessTokenLifetime).ToUnixTimeSeconds()}," +
                $"\"jti\":\"{Guid.NewGuid()}\"}}"
            ));
            var key = Encoding.UTF8.GetBytes("AlgoLens-Stateless-Dev-Secret-Key-2024-Phase6-256bit!");
            var signature = Convert.ToBase64String(
                HMACSHA256.HashData(key, Encoding.UTF8.GetBytes($"{header}.{payload}"))
            );
            return $"{header}.{payload}.{signature}";
        }

        private static void CheckLevelUp(InMemoryUser user)
        {
            var levelThresholds = new[] { 0, 100, 300, 600, 1000, 1500, 2200, 3000 };
            var newLevel = 1;
            for (var i = levelThresholds.Length - 1; i >= 0; i--)
            {
                if (user.TotalXP >= levelThresholds[i]) { newLevel = i + 1; break; }
            }
            if (newLevel > user.CurrentLevel) user.CurrentLevel = newLevel;
        }

        private static string HashPassword(string password)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password + "algolens-salt"));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        private static bool VerifyPassword(string password, string hash)
            => HashPassword(password) == hash;

        private static StatelessUserDto MapToUserDto(InMemoryUser user) => new()
        {
            Id = user.Id,
            Email = user.Email,
            Username = user.Username,
            TotalXP = user.TotalXP,
            CurrentLevel = user.CurrentLevel,
            StreakDays = user.StreakDays,
            CreatedAt = user.CreatedAt,
            Badges = user.Badges.Select(MapToBadgeDto).ToList(),
            IsPremium = user.IsPremium,
            Role = user.Role
        };

        private static StatelessBadgeInfoDto MapToBadgeDto(InMemoryBadge b) => new()
        {
            Id = b.Id, Name = b.Name, Description = b.Description,
            Icon = b.Icon, Color = b.Color, EarnedAt = b.EarnedAt
        };

        // ── Inner Types ──────────────────────────────────────────────────

        private class InMemoryUser
        {
            public string Id { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Username { get; set; } = string.Empty;
            public string PasswordHash { get; set; } = string.Empty;
            public int TotalXP { get; set; }
            public int CurrentLevel { get; set; }
            public int StreakDays { get; set; }
            public bool IsPremium { get; set; }
            public string Role { get; set; } = "Student";
            public DateTime CreatedAt { get; set; }
            public DateTime? LastLoginAt { get; set; }
            public List<InMemoryBadge> Badges { get; set; } = new();
            public List<string> CompletedModules { get; set; } = new();
        }

        private class InMemoryBadge
        {
            public string Id { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public string Icon { get; set; } = string.Empty;
            public string Color { get; set; } = string.Empty;
            public DateTime EarnedAt { get; set; }
        }
    }
}
