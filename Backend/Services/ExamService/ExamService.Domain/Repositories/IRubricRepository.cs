using ExamService.Domain.Entities;

namespace ExamService.Domain.Repositories;

public interface IRubricRepository
{
    Task<Rubric?> GetByExamIdAsync(Guid examId, CancellationToken cancellationToken = default);
    Task<Rubric?> GetByIdWithItemsAsync(Guid rubricId, CancellationToken cancellationToken = default);

    IQueryable<Rubric> GetQueryable();
}