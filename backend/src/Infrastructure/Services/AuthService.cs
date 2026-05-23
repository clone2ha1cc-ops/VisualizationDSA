using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;

namespace VisualizationDSA.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;

        public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            // Check if user exists
            var existingUsers = await _unitOfWork.Users.FindAsync(u => u.Email == request.Email);
            if (existingUsers != null)
            {
                throw new Exception("User with this email already exists");
            }

            // Hash password
            var passwordHash = HashPassword(request.Password);

            // Create user
            var user = new User(request.Email, request.Username, passwordHash);
            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.CommitAsync();

            // Generate JWT
            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                Token = token,
                User = MapToUserDto(user)
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            // Find user by email
            var users = await _unitOfWork.Users.FindAsync(u => u.Email == request.Email);
            var user = users.FirstOrDefault();

            if (user == null)
            {
                throw new Exception("Invalid email or password");
            }

            // Verify password
            if (!VerifyPassword(request.Password, user.PasswordHash))
            {
                throw new Exception("Invalid email or password");
            }

            // Update last login
            user.RecordLogin();
            await _unitOfWork.CommitAsync();

            // Generate JWT
            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                Token = token,
                User = MapToUserDto(user)
            };
        }

        public async Task<UserDto> GetCurrentUserAsync(string userId)
        {
            var id = Guid.Parse(userId);
            var user = await _unitOfWork.Users.GetByIdAsync(id);

            if (user == null)
            {
                throw new Exception("User not found");
            }

            return MapToUserDto(user);
        }

        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("level", user.CurrentLevel.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyPassword(string password, string passwordHash)
        {
            var hashedInput = HashPassword(password);
            return hashedInput == passwordHash;
        }

        private UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.Username,
                TotalXP = user.TotalXP,
                CurrentLevel = user.CurrentLevel,
                StreakDays = user.StreakDays,
                CreatedAt = user.CreatedAt,
                Badges = new List<BadgeDto>() // Will be populated separately
            };
        }
    }
}
