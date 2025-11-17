using GradingService.Domain.Entities;
using GradingService.Domain.Repositories;
using GradingService.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace GradingService.Infrastructure.Repositories;

public class SubmissionBatchRepository : Repository<SubmissionBatch> , ISubmissionBatchRepository
{
    public SubmissionBatchRepository(GradingDbContext context) : base(context)
    {
    }

    public async Task<SubmissionBatch> GetBatchForReportAsync(Guid batchId, CancellationToken cancellationToken)
    {
        return await _context.SubmissionBatches
            .Include(b => b.Exam)
                .ThenInclude(e => e.Rubric)
                    .ThenInclude(r => r.Items)
            .Include(b => b.Submissions)
                .ThenInclude(s => s.Grades)
                    .ThenInclude(g => g.GradedRubricItems)
            .Include(b => b.Submissions)
                .ThenInclude(s => s.Examiner)
            .Include(b => b.Submissions)
                .ThenInclude(s => s.Violations) 
            .Include(b => b.UploadedByManager)
            .FirstOrDefaultAsync(b => b.Id == batchId, cancellationToken);
    }
}
