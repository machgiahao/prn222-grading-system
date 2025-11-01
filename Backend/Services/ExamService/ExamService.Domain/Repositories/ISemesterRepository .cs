using ExamService.Domain.Entities;

namespace ExamService.Domain.Repositories;

public interface ISemesterRepository
{
    Task<Semester?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Semester?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    Task<List<Semester>> GetAllAsync(CancellationToken cancellationToken = default);

    void Add(Semester semester);

    void Remove(Semester semester);

    IQueryable<Semester> GetQueryable();
}
