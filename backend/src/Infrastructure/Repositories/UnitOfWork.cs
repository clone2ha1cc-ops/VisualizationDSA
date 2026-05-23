using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;

        public IRepository<User> Users { get; }
        public IRepository<Badge> Badges { get; }
        public IRepository<Quiz> Quizzes { get; }
        public IRepository<QuizAttempt> QuizAttempts { get; }
        public IRepository<LearningProgress> LearningProgresses { get; }

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
            Users = new Repository<User>(context);
            Badges = new Repository<Badge>(context);
            Quizzes = new Repository<Quiz>(context);
            QuizAttempts = new Repository<QuizAttempt>(context);
            LearningProgresses = new Repository<LearningProgress>(context);
        }

        public async Task<int> CommitAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}
