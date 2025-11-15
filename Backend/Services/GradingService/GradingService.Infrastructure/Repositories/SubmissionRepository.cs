using GradingService.Domain.Commons;
using GradingService.Domain.Entities;
using GradingService.Domain.Repositories;
using GradingService.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace GradingService.Infrastructure.Repositories;

public class SubmissionRepository : Repository<Submission>, ISubmissionRepository
{
    public SubmissionRepository(GradingDbContext context) : base(context) { }

    public async Task<List<Submission>> GetReadyToGradeSubmissionsAsync(Guid batchId, CancellationToken cancellationToken)
    {
        return await _dbSet.Where(
            s => s.SubmissionBatchId == batchId &&
                 s.ExaminerId == null &&
                 s.Status == SubmissionStatus.ReadyToGrade
        ).ToListAsync(cancellationToken);
    }
}
