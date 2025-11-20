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

    public async Task<Submission> GetSubmissionWithGradingDetailsAsync(Guid submissionId, CancellationToken cancellationToken)
    {
        return await _dbSet.Where(s => s.Id == submissionId)
                .Include(s => s.Batch) 
                    .ThenInclude(b => b.Exam) 
                        .ThenInclude(e => e.Rubric)
                            .ThenInclude(r => r.Items) 
                .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<List<Submission>> GetAssignedTasksForExaminerAsync(Guid examinerId, CancellationToken cancellationToken)
    {
        return await _dbSet
            .Where(s => s.ExaminerId == examinerId && s.Status == SubmissionStatus.Assigned)
            .Include(s => s.Batch)
            .OrderBy(s => s.Batch.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Submission>> GetModerationQueueAsync(CancellationToken cancellationToken)
    {
        return await _context.Submissions
            .Include(s => s.Violations)
            .Include(s => s.Batch)
            .Where(s => s.Status == SubmissionStatus.Flagged && s.Violations.Any())
            .OrderByDescending(s => s.Violations.Count)  
            .ToListAsync(cancellationToken);
    }

    public async Task<Submission?> GetByIdWithViolationsAsync(Guid submissionId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(s => s.Id == submissionId)
            .Include(s => s.Violations)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<(List<Submission> Items, int TotalCount)> GetAllWithFiltersAsync(
        int pageIndex,
        int pageSize,
        Guid? examId = null,
        Guid? submissionBatchId = null,
        string? status = null,
        CancellationToken cancellationToken = default)
    {
        // Base query with all includes
        var query = _context.Submissions
            .Include(s => s.Batch)
                .ThenInclude(b => b.Exam)
            .Include(s => s.Examiner)
            .Include(s => s.Grades)
                .ThenInclude(g => g.GradedRubricItems)  
            .AsQueryable();

        // Apply filters
        if (examId.HasValue)
        {
            query = query.Where(s => s.Batch.ExamId == examId.Value);
        }

        if (submissionBatchId.HasValue)
        {
            query = query.Where(s => s.SubmissionBatchId == submissionBatchId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(s => s.Status == status);
        }

        // Get total count BEFORE pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply ordering and pagination
        var items = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
