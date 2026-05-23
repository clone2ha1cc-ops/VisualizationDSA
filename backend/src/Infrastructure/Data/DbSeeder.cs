using System;
using System.Collections.Generic;
using System.Linq;
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
    }
}
