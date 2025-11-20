using ExamService.Domain.Entities;
using ExamService.Domain.Repositories;
using ExamService.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace ExamService.Infrastructure.Repositories;

public class RubricRepository : IRubricRepository
{
    private readonly ExamDbContext _context;

    public RubricRepository(ExamDbContext context)
    {
        _context = context;
    }

    public async Task<Rubric?> GetByExamIdAsync(Guid examId, CancellationToken cancellationToken = default)
    {
        return await _context.Rubric
            .Include(r => r.Items.OrderBy(i => i.CreatedAt))
            .FirstOrDefaultAsync(r => r.ExamId == examId, cancellationToken);
    }

    public async Task<Rubric?> GetByIdWithItemsAsync(Guid rubricId, CancellationToken cancellationToken = default)
    {
        return await _context.Rubric
            .Include(r => r.Items.OrderBy(i => i.CreatedAt))
            .FirstOrDefaultAsync(r => r.Id == rubricId, cancellationToken);
    }

    public IQueryable<Rubric> GetQueryable()
    {
        return _context.Rubric.AsQueryable();
    }
}