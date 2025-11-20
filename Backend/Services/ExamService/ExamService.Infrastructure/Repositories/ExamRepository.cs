using ExamService.Domain.Entities;
using ExamService.Domain.Repositories;
using ExamService.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace ExamService.Infrastructure.Repositories;

public class ExamRepository : IExamRepository
{
    private readonly ExamDbContext _context;

    public ExamRepository(ExamDbContext context)
    {
        _context = context;
    }

    public void Add(Exam exam)
    {
        _context.Exam.Add(exam);
    }

    public IQueryable<Exam> GetQueryable()
    {
        return _context.Exam.AsQueryable();
    }

    public async Task<Exam?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Exam
            .Include(e => e.Subject)
            .Include(e => e.Semester)
            .Include(e => e.Rubric)
                .ThenInclude(r => r.Items.OrderBy(i => i.CreatedAt))
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public void Update(Exam exam)
    {
        _context.Exam.Update(exam);
    }

    public void Remove(Exam exam)
    {
        _context.Exam.Remove(exam);
    }

    public async Task<Exam?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.Exam.FirstOrDefaultAsync(e => e.ExamCode == code, cancellationToken);
    }
}