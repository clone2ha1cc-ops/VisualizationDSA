using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Asp.Versioning;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// Quiz API — serves quiz bank from in-memory + PostgreSQL persistence.
    /// Route: /api/v1/concepts/quiz
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/concepts/quiz")]
    public class StatelessQuizController : ControllerBase
    {
        private readonly QuizBankStrategy _quizBank;
        private readonly ApplicationDbContext _dbContext;
        private static readonly List<StatelessQuizAttemptResult> _attemptLog = new();

        public StatelessQuizController(QuizBankStrategy quizBank, ApplicationDbContext dbContext)
        {
            _quizBank = quizBank;
            _dbContext = dbContext;
        }

        /// <summary>
        /// Lấy danh sách tất cả quiz trong ngân hàng câu hỏi.
        /// GET /api/v1/concepts/quiz/all
        /// </summary>
        [HttpGet("all")]
        public IActionResult GetAll()
        {
            var quizzes = _quizBank.GetAllQuizzes().Select(q => new
            {
                q.Id, q.Title, q.Topic, q.Difficulty, q.XpReward,
                questionCount = q.Questions.Count
            });
            return Ok(quizzes);
        }

        /// <summary>
        /// Lấy danh sách các chủ đề quiz.
        /// GET /api/v1/concepts/quiz/topics
        /// </summary>
        [HttpGet("topics")]
        public IActionResult GetTopics()
        {
            return Ok(_quizBank.GetTopics());
        }

        /// <summary>
        /// Lấy chi tiết một quiz theo ID (bao gồm câu hỏi + đáp án).
        /// GET /api/v1/concepts/quiz/{quizId}
        /// </summary>
        [HttpGet("{quizId}")]
        public IActionResult GetById(string quizId)
        {
            var quiz = _quizBank.GetQuizById(quizId);
            if (quiz == null)
                return NotFound(new { error = "QUIZ_NOT_FOUND", quizId, supportedQuizzes = _quizBank.GetAllQuizzes().Select(q => q.Id) });
            return Ok(quiz);
        }

        /// <summary>
        /// Lấy quiz theo chủ đề.
        /// GET /api/v1/concepts/quiz/topic/{topic}
        /// </summary>
        [HttpGet("topic/{topic}")]
        public IActionResult GetByTopic(string topic)
        {
            var quizzes = _quizBank.GetQuizzesByTopic(topic);
            return Ok(quizzes);
        }

        /// <summary>
        /// Submit câu trả lời và nhận kết quả chấm điểm.
        /// POST /api/v1/concepts/quiz/submit
        /// </summary>
        [HttpPost("submit")]
        public IActionResult SubmitAttempt([FromBody] StatelessQuizAttemptRequest request)
        {
            try
            {
                var result = _quizBank.EvaluateAttempt(request);
                _attemptLog.Add(result);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = "QUIZ_NOT_FOUND", message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = "INVALID_ANSWERS", message = ex.Message });
            }
        }

        /// <summary>
        /// Teacher: thêm quiz mới vào ngân hàng câu hỏi.
        /// POST /api/v1/concepts/quiz/manage
        /// </summary>
        [HttpPost("manage")]
        public async Task<IActionResult> ManageQuiz([FromBody] StatelessQuizDto quiz)
        {
            if (string.IsNullOrWhiteSpace(quiz.Title) || quiz.Questions.Count == 0)
                return BadRequest(new { error = "INVALID_QUIZ", message = "Quiz phải có tiêu đề và ít nhất 1 câu hỏi." });

            // Add to in-memory bank for immediate availability
            var created = _quizBank.AddQuiz(quiz);

            // Persist to PostgreSQL
            var difficultyInt = quiz.Difficulty switch
            {
                "easy" => 1, "medium" => 3, "hard" => 5, _ => 3
            };
            var dbQuiz = new Quiz(quiz.Title, quiz.Topic, quiz.Topic, difficultyInt, quiz.XpReward);
            foreach (var q in quiz.Questions)
            {
                dbQuiz.AddQuestion(q.Text, q.Options.ToArray(), q.CorrectIndex, q.Explanation ?? "");
            }
            _dbContext.Quizzes.Add(dbQuiz);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Quiz đã được thêm thành công.", quiz = created });
        }

        /// <summary>
        /// Teacher analytics: thống kê tổng quan hoạt động quiz.
        /// GET /api/v1/concepts/quiz/analytics
        /// </summary>
        [HttpGet("analytics")]
        public IActionResult GetAnalytics()
        {
            var totalQuizzes = _quizBank.GetAllQuizzes().Count;
            var totalAttempts = _attemptLog.Count;
            var passedAttempts = _attemptLog.Count(a => a.Passed);
            var avgPassRate = totalAttempts > 0
                ? Math.Round(passedAttempts * 100.0 / totalAttempts, 1)
                : 0;
            var totalQuestionsAnswered = _attemptLog.Sum(a => a.MaxScore);

            return Ok(new
            {
                totalQuizzes,
                totalAttempts,
                passedAttempts,
                failedAttempts = totalAttempts - passedAttempts,
                averagePassRate = avgPassRate,
                totalQuestionsAnswered,
                topicBreakdown = _quizBank.GetTopics().Select(t => new
                {
                    topic = t,
                    quizCount = _quizBank.GetQuizzesByTopic(t).Count
                })
            });
        }
    }
}
