using Microsoft.EntityFrameworkCore;
using System;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Badge> Badges { get; set; }
        public DbSet<UserBadge> UserBadges { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<QuizQuestion> QuizQuestions { get; set; }
        public DbSet<QuizAttempt> QuizAttempts { get; set; }
        public DbSet<LearningProgress> LearningProgresses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.Username).IsUnique();
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.TotalXP).HasDefaultValue(0);
                entity.Property(e => e.CurrentLevel).HasDefaultValue(1);
                entity.Property(e => e.StreakDays).HasDefaultValue(0);
            });

            // Badge configuration
            modelBuilder.Entity<Badge>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Name).IsUnique();
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Icon).HasMaxLength(50);
                entity.Property(e => e.Color).HasMaxLength(20);
            });

            // UserBadge configuration (many-to-many)
            modelBuilder.Entity<UserBadge>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.BadgeId }).IsUnique();
                entity.HasOne(e => e.User).WithMany(u => u.UserBadges).HasForeignKey(e => e.UserId);
                entity.HasOne(e => e.Badge).WithMany(b => b.UserBadges).HasForeignKey(e => e.BadgeId);
            });

            // Quiz configuration
            modelBuilder.Entity<Quiz>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Topic).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Difficulty).HasDefaultValue(1);
                entity.HasMany(e => e.Questions).WithOne().HasForeignKey(q => q.QuizId);
            });

            // QuizQuestion configuration
            modelBuilder.Entity<QuizQuestion>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Question).IsRequired().HasMaxLength(500);
            });

            // QuizAttempt configuration
            modelBuilder.Entity<QuizAttempt>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User).WithMany(u => u.QuizAttempts).HasForeignKey(e => e.UserId);
                entity.HasOne(e => e.Quiz).WithMany(q => q.Attempts).HasForeignKey(e => e.QuizId);
            });

            // LearningProgress configuration
            modelBuilder.Entity<LearningProgress>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.ModuleId }).IsUnique();
                entity.HasOne(e => e.User).WithMany(u => u.LearningProgresses).HasForeignKey(e => e.UserId);
            });
        }
    }
}
