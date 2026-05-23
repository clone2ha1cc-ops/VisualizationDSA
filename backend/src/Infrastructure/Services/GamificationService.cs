using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;

namespace VisualizationDSA.Infrastructure.Services
{
    public class GamificationService : IGamificationService
    {
        private readonly IUnitOfWork _unitOfWork;

        public GamificationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task AwardXPAsync(Guid userId, int amount, string reason)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) throw new Exception("User not found");

            user.AwardXP(amount);
            await _unitOfWork.CommitAsync();
        }

        public async Task CompleteModuleAsync(Guid userId, string moduleId)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) throw new Exception("User not found");

            user.CompleteModule(moduleId);
            await _unitOfWork.CommitAsync();
        }

        public async Task<IEnumerable<Badge>> CheckAndAwardBadgesAsync(Guid userId)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) throw new Exception("User not found");

            var newBadges = new List<Badge>();
            var allBadges = await _unitOfWork.Badges.GetAllAsync();

            foreach (var badge in allBadges)
            {
                // Check if user already has this badge
                if (user.UserBadges.Any(ub => ub.BadgeId == badge.Id))
                    continue;

                // Check criteria
                if (ShouldAwardBadge(user, badge))
                {
                    var userBadge = new UserBadge(userId, badge.Id);
                    await _unitOfWork.Users.AddAsync(user); // Re-attach user
                    user.UserBadges.Add(userBadge);
                    newBadges.Add(badge);
                }
            }

            if (newBadges.Any())
            {
                await _unitOfWork.CommitAsync();
            }

            return newBadges;
        }

        public async Task<UserProgressStats> GetUserProgressAsync(Guid userId)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) throw new Exception("User not found");

            // Calculate level progress
            var nextLevelXp = CalculateXpForLevel(user.CurrentLevel + 1);
            var currentLevelXp = CalculateXpForLevel(user.CurrentLevel);
            var xpInCurrentLevel = user.TotalXP - currentLevelXp;
            var xpNeeded = nextLevelXp - currentLevelXp;
            var progressPercent = Math.Min(100, (int)((double)xpInCurrentLevel / xpNeeded * 100));

            return new UserProgressStats
            {
                TotalXP = user.TotalXP,
                CurrentLevel = user.CurrentLevel,
                XpToNextLevel = nextLevelXp - user.TotalXP,
                LevelProgressPercent = progressPercent,
                BadgesEarned = user.UserBadges.Count,
                ModulesCompleted = user.LearningProgresses.Count,
                CurrentStreak = user.StreakDays
            };
        }

        private bool ShouldAwardBadge(User user, Badge badge)
        {
            // Simple criteria checking based on badge name
            return badge.Name switch
            {
                "First Steps" => user.QuizAttempts.Count >= 1,
                "Sorting Wizard" => user.LearningProgresses.Any(lp => lp.ModuleId.Contains("sort")),
                "OOP Guru" => user.LearningProgresses.Any(lp => lp.ModuleId.Contains("oop")),
                "SOLID Master" => user.LearningProgresses.Any(lp => lp.ModuleId.Contains("solid")),
                "Pattern Hunter" => user.LearningProgresses.Any(lp => lp.ModuleId.Contains("pattern")),
                "Streak Keeper" => user.StreakDays >= 7,
                "System Architect" => user.LearningProgresses.Any(lp => lp.ModuleId.Contains("system")),
                "DSA Champion" => user.CurrentLevel >= 5,
                _ => false
            };
        }

        private int CalculateXpForLevel(int level)
        {
            // Level formula: XP = (level-1)^2 * 100
            return (level - 1) * (level - 1) * 100;
        }
    }
}
