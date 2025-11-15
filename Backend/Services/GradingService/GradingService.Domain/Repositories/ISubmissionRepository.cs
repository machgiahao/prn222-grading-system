using GradingService.Domain.Entities;
using SharedLibrary.Common.Repositories;

namespace GradingService.Domain.Repositories;

public interface ISubmissionRepository : IRepository<Submission>
{
    Task<List<Submission>> GetReadyToGradeSubmissionsAsync(Guid batchId, CancellationToken cancellationToken);
}
