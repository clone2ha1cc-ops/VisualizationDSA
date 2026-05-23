using System;
using System.Collections.Generic;

namespace VisualizationDSA.Application.DTOs
{
    public class QuizDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Topic { get; set; }
        public int Difficulty { get; set; }
        public int XPReward { get; set; }
        public List<QuizQuestionDto> Questions { get; set; }
    }

    public class QuizQuestionDto
    {
        public Guid Id { get; set; }
        public string Question { get; set; }
        public string[] Options { get; set; }
        public string Explanation { get; set; }
        // Note: CorrectIndex is NOT included to prevent cheating
    }

    public class QuizAttemptRequest
    {
        public Guid QuizId { get; set; }
        public int[] Answers { get; set; } // Selected option indices
    }

    public class QuizAttemptResult
    {
        public int Score { get; set; }
        public int MaxScore { get; set; }
        public bool Passed { get; set; }
        public int XPEarned { get; set; }
        public List<QuestionResult> QuestionResults { get; set; }
    }

    public class QuestionResult
    {
        public Guid QuestionId { get; set; }
        public bool IsCorrect { get; set; }
        public int CorrectIndex { get; set; }
        public string Explanation { get; set; }
    }
}
