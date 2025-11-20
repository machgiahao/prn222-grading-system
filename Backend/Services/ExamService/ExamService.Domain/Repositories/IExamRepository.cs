using ExamService.Domain.Entities;

namespace ExamService.Domain.Repositories
{
    public interface IExamRepository
    {
        void Add(Exam exam);
        IQueryable<Exam> GetQueryable();
        Task<Exam?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        void Update(Exam exam);
        void Remove(Exam exam);
        Task<Exam?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    }
}
