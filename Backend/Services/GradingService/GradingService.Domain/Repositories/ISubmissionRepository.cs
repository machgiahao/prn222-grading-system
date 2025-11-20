using GradingService.Domain.Entities;
using SharedLibrary.Common.Repositories;

namespace GradingService.Domain.Repositories;

public interface ISubmissionRepository : IRepository<Submission>
{
    Task<List<Submission>> GetReadyToGradeSubmissionsAsync(Guid batchId, CancellationToken cancellationToken);
    Task<Submission> GetSubmissionWithGradingDetailsAsync(Guid submissionId, CancellationToken cancellationToken);
    Task<List<Submission>> GetAssignedTasksForExaminerAsync(Guid examinerId, CancellationToken cancellationToken);
    Task<List<Submission>> GetModerationQueueAsync(CancellationToken cancellationToken);
    Task<Submission?> GetByIdWithViolationsAsync(Guid submissionId, CancellationToken cancellationToken = default);
    Task<(List<Submission> Items, int TotalCount)> GetAllWithFiltersAsync(
       int pageIndex,
       int pageSize,
       Guid? examId = null,
       Guid? submissionBatchId = null,
       string? status = null,
       CancellationToken cancellationToken = default);
}
