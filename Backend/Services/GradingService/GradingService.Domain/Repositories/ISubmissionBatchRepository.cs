using GradingService.Domain.Entities;
using SharedLibrary.Common.Repositories;

namespace GradingService.Domain.Repositories;

public interface ISubmissionBatchRepository : IRepository<SubmissionBatch>
{
    Task<SubmissionBatch> GetBatchForReportAsync(Guid batchId, CancellationToken cancellationToken);

    Task<List<SubmissionBatch>> GetBatchesForSummaryAsync(
        Guid? examId = null,
        CancellationToken cancellationToken = default);

    Task<SubmissionBatch?> GetBatchWithSubmissionsAsync(
        Guid batchId,
        CancellationToken cancellationToken = default);

    Task<SubmissionBatch?> GetBatchForApprovalAsync(
        Guid batchId,
        CancellationToken cancellationToken = default);
}
