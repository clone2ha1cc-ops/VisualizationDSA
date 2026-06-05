using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Infrastructure.Data
{
    public class DbSeeder
    {
        private readonly ApplicationDbContext _context;

        public DbSeeder(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            await SeedBadgesAsync();
            await SeedLeaderboardUsersAsync();
            await SeedQuizzesAsync();
        }

        private async Task SeedBadgesAsync()
        {
            if (_context.Badges.Any()) return;

            var badges = new List<Badge>
            {
                new Badge("First Steps", "Hoàn thành bài trắc nghiệm đầu tiên", "🎯", "#22c55e", "{ 'quizCompleted': 1 }"),
                new Badge("Sorting Wizard", "Hoàn thành 4 thuật toán sắp xếp", "⚡", "#3b82f6", "{ 'sortingCompleted': 4 }"),
                new Badge("OOP Guru", "Hiểu rõ Encapsulation & Inheritance", "🔐", "#8b5cf6", "{ 'oopCompleted': 2 }"),
                new Badge("SOLID Master", "Áp dụng đúng 5 nguyên lý SOLID", "🏛️", "#f59e0b", "{ 'solidCompleted': 5 }"),
                new Badge("Pattern Hunter", "Sử dụng 3 Design Patterns", "🎨", "#ec4899", "{ 'patternsCompleted': 3 }"),
                new Badge("Streak Keeper", "Học liên tục 7 ngày", "🔥", "#ef4444", "{ 'streakDays': 7 }"),
                new Badge("System Architect", "Thiết kế hệ thống phân tán", "🏗️", "#f97316", "{ 'systemCompleted': 1 }"),
                new Badge("DSA Champion", "Hoàn thành toàn bộ khóa học", "👑", "#eab308", "{ 'level': 5 }")
            };

            foreach (var badge in badges)
            {
                await _context.Badges.AddAsync(badge);
            }

            await _context.SaveChangesAsync();
        }

        private async Task SeedQuizzesAsync()
        {
            if (_context.Quizzes.Any()) return;

            // Bubble Sort Quiz
            var bubbleSortQuiz = new Quiz(
                "Bubble Sort Mastery",
                "Test your knowledge of Bubble Sort algorithm",
                "sorting",
                1,
                50
            );
            bubbleSortQuiz.AddQuestion(
                "What is the time complexity of Bubble Sort in the worst case?",
                new[] { "O(n)", "O(n log n)", "O(n²)", "O(2^n)" },
                2,
                "Bubble Sort compares adjacent elements and swaps them if needed, resulting in O(n²) complexity."
            );
            bubbleSortQuiz.AddQuestion(
                "What is the best case time complexity of Bubble Sort?",
                new[] { "O(n)", "O(n log n)", "O(n²)", "O(1)" },
                0,
                "When the array is already sorted, Bubble Sort only needs one pass, achieving O(n)."
            );
            bubbleSortQuiz.AddQuestion(
                "Is Bubble Sort a stable sorting algorithm?",
                new[] { "Yes", "No", "Only with integers", "Depends on implementation" },
                0,
                "Bubble Sort is stable because it only swaps adjacent elements when necessary."
            );

            // Quick Sort Quiz
            var quickSortQuiz = new Quiz(
                "Quick Sort Fundamentals",
                "Master the divide-and-conquer approach of Quick Sort",
                "sorting",
                2,
                75
            );
            quickSortQuiz.AddQuestion(
                "What is the average case time complexity of Quick Sort?",
                new[] { "O(n)", "O(n log n)", "O(n²)", "O(log n)" },
                1,
                "Quick Sort divides the array and sorts partitions, achieving O(n log n) on average."
            );
            quickSortQuiz.AddQuestion(
                "What is the pivot in Quick Sort?",
                new[] { "The first element", "The middle element", "An element that partitions the array", "The largest element" },
                2,
                "The pivot is an element that divides the array into elements less than and greater than it."
            );

            // OOP Quiz
            var oopQuiz = new Quiz(
                "OOP Concepts",
                "Test your understanding of Object-Oriented Programming",
                "oop",
                2,
                100
            );
            oopQuiz.AddQuestion(
                "Which principle hides implementation details and exposes only necessary functionality?",
                new[] { "Inheritance", "Encapsulation", "Polymorphism", "Abstraction" },
                1,
                "Encapsulation bundles data and methods, hiding internal implementation."
            );
            oopQuiz.AddQuestion(
                "What allows a subclass to inherit properties from a parent class?",
                new[] { "Inheritance", "Encapsulation", "Polymorphism", "Composition" },
                0,
                "Inheritance enables code reuse by allowing subclasses to inherit parent properties."
            );

            // SOLID Quiz
            var solidQuiz = new Quiz(
                "SOLID Principles",
                "Master the 5 SOLID principles of software design",
                "solid",
                3,
                125
            );
            solidQuiz.AddQuestion(
                "Which principle states that a class should have only one reason to change?",
                new[] { "Open/Closed", "Single Responsibility", "Liskov Substitution", "Interface Segregation" },
                1,
                "Single Responsibility Principle (SRP) states a class should have one responsibility."
            );
            solidQuiz.AddQuestion(
                "Which principle suggests classes should be open for extension but closed for modification?",
                new[] { "Open/Closed", "Single Responsibility", "Liskov Substitution", "Dependency Inversion" },
                0,
                "Open/Closed Principle (OCP) encourages extension through inheritance or composition."
            );

            // Design Patterns Quiz
            var patternsQuiz = new Quiz(
                "Design Patterns",
                "Recognize common design patterns and their use cases",
                "patterns",
                3,
                150
            );
            patternsQuiz.AddQuestion(
                "Which pattern defines a one-to-many dependency between objects?",
                new[] { "Strategy", "Observer", "Factory", "Singleton" },
                1,
                "Observer pattern allows objects to subscribe to events and get notified automatically."
            );
            patternsQuiz.AddQuestion(
                "Which pattern lets you change an algorithm's behavior at runtime?",
                new[] { "Observer", "Strategy", "Decorator", "Builder" },
                1,
                "Strategy pattern defines a family of algorithms and makes them interchangeable."
            );

            await _context.Quizzes.AddRangeAsync(bubbleSortQuiz, quickSortQuiz, oopQuiz, solidQuiz, patternsQuiz);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Seed 10 Vietnamese leaderboard users vào bảng Users.
        /// Mỗi user có XP, level, streak khác nhau để tạo bảng xếp hạng phong phú.
        /// </summary>
        private async Task SeedLeaderboardUsersAsync()
        {
            if (_context.Users.Any()) return;

            var demoHash = HashPasswordSHA256("Demo@2024");

            var users = new (string email, string username, string password, int xp, int level, int streak)[]
            {
                ("nguyenvana@algolens.dev",   "NguyenVanA",       "User@2024", 2850, 7, 14),
                ("tranthib@algolens.dev",     "TranThiB",         "User@2024", 2200, 7, 10),
                ("levanc@algolens.dev",       "LeVanC",           "User@2024", 1800, 6, 8),
                ("phamthid@algolens.dev",     "PhamThiD",         "User@2024", 1500, 6, 12),
                ("hoangvane@algolens.dev",    "HoangVanE",        "User@2024", 1200, 5, 6),
                ("vuthif@algolens.dev",       "VuThiF",           "User@2024", 950,  4, 5),
                ("dangvang@algolens.dev",     "DangVanG",         "User@2024", 700,  4, 4),
                ("buithih@algolens.dev",      "BuiThiH",          "User@2024", 450,  3, 3),
                ("dovani@algolens.dev",       "DoVanI",           "User@2024", 250,  2, 2),
                ("demo@algolens.dev",         "AlgoLens Student", "Demo@2024", 150,  2, 3),
            };

            foreach (var (email, username, password, xp, level, streak) in users)
            {
                var passwordHash = HashPasswordSHA256(password);
                var user = new User(email, username, passwordHash);
                // Award XP to set level correctly via the entity's business logic
                if (xp > 0) user.AwardXP(xp);
                await _context.Users.AddAsync(user);
            }

            await _context.SaveChangesAsync();
        }

        private static string HashPasswordSHA256(string password)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password + "algolens-salt"));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }
    }
}
