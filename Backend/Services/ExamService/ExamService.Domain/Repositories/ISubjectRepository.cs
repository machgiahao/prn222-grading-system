using ExamService.Domain.Entities;

namespace ExamService.Domain.Repositories;

public interface ISubjectRepository
{
    Task<Subject?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Subject?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    Task<List<Subject>> GetAllAsync(CancellationToken cancellationToken = default);

    void Add(Subject subject);

    void Remove(Subject subject);
}
