using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;

namespace VisualizationDSA.Domain.Interfaces
{
    public interface IUnitOfWork
    {
        IRepository<User> Users { get; }
        IRepository<Badge> Badges { get; }
        IRepository<Quiz> Quizzes { get; }
        IRepository<QuizAttempt> QuizAttempts { get; }
        IRepository<LearningProgress> LearningProgresses { get; }
        
        Task<int> CommitAsync();
    }
}
