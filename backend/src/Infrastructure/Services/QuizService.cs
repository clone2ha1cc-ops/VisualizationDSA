using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;


namespace VisualizationDSA.Infrastructure.Services
{
    public class QuizService : IQuizService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGamificationService _gamificationService;

        public QuizService(IUnitOfWork unitOfWork, IGamificationService gamificationService)
        {
            _unitOfWork = unitOfWork;
            _gamificationService = gamificationService;
        }

        public async Task<IEnumerable<QuizDto>> GetAllQuizzesAsync()
        {
            var quizzes = await _unitOfWork.Quizzes.GetAllAsync();
            return quizzes.Select(MapToQuizDto);
        }

        public async Task<QuizDto> GetQuizByIdAsync(Guid id)
        {
            var quiz = await _unitOfWork.Quizzes.GetByIdWithQuestionsAsync(id);
            if (quiz == null) throw new Exception("Quiz not found");
            return MapToQuizDto(quiz);
        }

        public async Task<IEnumerable<QuizDto>> GetQuizzesByTopicAsync(string topic)
        {
            var quizzes = await _unitOfWork.Quizzes.FindAsync(q => q.Topic == topic);
            return quizzes.Select(MapToQuizDto);
        }

        public async Task<QuizAttemptResult> SubmitQuizAttemptAsync(Guid userId, QuizAttemptRequest request)
        {
            var quiz = await _unitOfWork.Quizzes.GetByIdWithQuestionsAsync(request.QuizId);
            if (quiz == null) throw new Exception("Quiz not found");

            var questions = quiz.Questions.ToList();
            if (request.Answers.Length != questions.Count)
            {
                throw new Exception("Number of answers does not match number of questions");
            }

            // Calculate score
            int score = 0;
            var questionResults = new List<QuestionResult>();

            for (int i = 0; i < questions.Count; i++)
            {
                var question = questions[i];
                var isCorrect = request.Answers[i] == question.CorrectIndex;
                if (isCorrect) score++;

                questionResults.Add(new QuestionResult
                {
                    QuestionId = question.Id,
                    IsCorrect = isCorrect,
                    CorrectIndex = question.CorrectIndex,
                    Explanation = question.Explanation
                });
            }

            var maxScore = questions.Count;
            var passed = score >= maxScore * 0.7; // 70% to pass

            // Save attempt
            var attempt = new QuizAttempt(userId, quiz.Id, request.Answers, score, maxScore);
            await _unitOfWork.QuizAttempts.AddAsync(attempt);

            // Award XP if passed
            int xpEarned = 0;
            if (passed)
            {
                xpEarned = quiz.XPReward;
                await _gamificationService.AwardXPAsync(userId, xpEarned, $"Completed quiz: {quiz.Title}");
                await _gamificationService.CompleteModuleAsync(userId, $"quiz-{quiz.Topic}");
            }

            await _unitOfWork.CommitAsync();

            return new QuizAttemptResult
            {
                Score = score,
                MaxScore = maxScore,
                Passed = passed,
                XPEarned = xpEarned,
                QuestionResults = questionResults
            };
        }

        public async Task<IEnumerable<QuizAttemptDto>> GetUserQuizHistoryAsync(Guid userId, int pageNumber, int pageSize)
        {
            // Clamp values safely
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var attempts = await _unitOfWork.Quizzes.GetUserAttemptsWithQuizPaginatedAsync(userId, pageNumber, pageSize);

            return attempts.Select(attempt => new QuizAttemptDto
            {
                QuizId      = attempt.QuizId,
                QuizTitle   = attempt.Quiz?.Title ?? "Unknown Quiz",
                Score       = attempt.Score,
                MaxScore    = attempt.MaxScore,
                Passed      = attempt.Passed,
                AttemptedAt = attempt.AttemptedAt
            });
        }

        private QuizDto MapToQuizDto(Quiz quiz)
        {
            return new QuizDto
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Description = quiz.Description,
                Topic = quiz.Topic,
                Difficulty = quiz.Difficulty,
                XPReward = quiz.XPReward,
                Questions = quiz.Questions.Select(q => new QuizQuestionDto
                {
                    Id = q.Id,
                    Question = q.Question,
                    Options = q.Options,
                    Explanation = string.Empty // ✅ Anti-cheat: Hide explanation in initial load
                }).ToList()
            };
        }
    }
}
