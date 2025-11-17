using GradingService.Domain.Entities;
using SharedLibrary.Common.Repositories;

namespace GradingService.Domain.Repositories;

public interface ISubmissionBatchRepository : IRepository<SubmissionBatch>
{
    Task<SubmissionBatch> GetBatchForReportAsync(Guid batchId, CancellationToken cancellationToken);
}
