using GradingService.Domain.Entities;
using SharedLibrary.Common.Repositories;

namespace GradingService.Domain.Repositories;

public interface IViolationRepository : IRepository<Violation>
{
    Task<List<Violation>> GetBySubmissionIdAsync(Guid submissionId, CancellationToken cancellationToken = default);
}
