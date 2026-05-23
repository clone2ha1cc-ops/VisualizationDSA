using System;
using System.Collections.Generic;

namespace VisualizationDSA.Application.DTOs
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string Username { get; set; }
        public int TotalXP { get; set; }
        public int CurrentLevel { get; set; }
        public int StreakDays { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<BadgeDto> Badges { get; set; }
    }

    public class BadgeDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public string Color { get; set; }
        public DateTime EarnedAt { get; set; }
    }

    public class RegisterRequest
    {
        public string Email { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class AuthResponse
    {
        public string Token { get; set; }
        public UserDto User { get; set; }
    }

    public class XPAwardRequest
    {
        public int Amount { get; set; }
        public string Reason { get; set; }
    }
}
