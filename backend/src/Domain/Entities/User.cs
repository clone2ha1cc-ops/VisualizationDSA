using System;
using System.Collections.Generic;

namespace VisualizationDSA.Domain.Entities
{
    public class User
    {
        public Guid Id { get; private set; }
        public string Email { get; private set; }
        public string Username { get; private set; }
        public string PasswordHash { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? LastLoginAt { get; private set; }
        
        // Gamification
        public int TotalXP { get; private set; }
        public int CurrentLevel { get; private set; }
        public int StreakDays { get; private set; }
        
        // Navigation properties
        public virtual ICollection<UserBadge> UserBadges { get; private set; }
        public virtual ICollection<QuizAttempt> QuizAttempts { get; private set; }
        public virtual ICollection<LearningProgress> LearningProgresses { get; private set; }

        private User() { } // EF Core protected constructor

        public User(string email, string username, string passwordHash)
        {
            Id = Guid.NewGuid();
            Email = email;
            Username = username;
            PasswordHash = passwordHash;
            CreatedAt = DateTime.UtcNow;
            TotalXP = 0;
            CurrentLevel = 1;
            StreakDays = 0;
            UserBadges = new List<UserBadge>();
            QuizAttempts = new List<QuizAttempt>();
            LearningProgresses = new List<LearningProgress>();
        }

        public void AwardXP(int amount)
        {
            TotalXP += amount;
            CheckLevelUp();
        }

        public void CompleteModule(string moduleId)
        {
            var progress = new LearningProgress(Id, moduleId);
            LearningProgresses.Add(progress);
        }

        public void RecordLogin()
        {
            LastLoginAt = DateTime.UtcNow;
        }

        private void CheckLevelUp()
        {
            // Simple level formula: Level = 1 + sqrt(TotalXP / 100)
            var newLevel = 1 + (int)Math.Floor(Math.Sqrt(TotalXP / 100.0));
            if (newLevel > CurrentLevel)
            {
                CurrentLevel = newLevel;
            }
        }
    }
}
