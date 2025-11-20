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

    public async Task<List<SubmissionBatch>> GetBatchesForSummaryAsync(
        Guid? examId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.SubmissionBatches
            .Include(b => b.Exam)
            .Include(b => b.Submissions)
                .ThenInclude(s => s.Violations)
            .Include(b => b.Submissions)
                .ThenInclude(s => s.Grades)
            .AsQueryable();

        if (examId.HasValue)
        {
            query = query.Where(b => b.ExamId == examId.Value);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<SubmissionBatch?> GetBatchWithSubmissionsAsync(
        Guid batchId,
        CancellationToken cancellationToken = default)
    {
        return await _context.SubmissionBatches
            .Include(b => b.Submissions)
                .ThenInclude(s => s.Grades)
            .Include(b => b.Exam)
            .FirstOrDefaultAsync(b => b.Id == batchId, cancellationToken);
    }

    public async Task<SubmissionBatch?> GetBatchForApprovalAsync(
    Guid batchId,
    CancellationToken cancellationToken = default)
    {
        return await _context.SubmissionBatches
            .Include(b => b.Exam)
            .Include(b => b.Submissions)
                .ThenInclude(s => s.Grades)
                    .ThenInclude(g => g.GradedRubricItems)
            .Include(b => b.Submissions)
                .ThenInclude(s => s.Violations)
            .FirstOrDefaultAsync(b => b.Id == batchId, cancellationToken);
    }
}
