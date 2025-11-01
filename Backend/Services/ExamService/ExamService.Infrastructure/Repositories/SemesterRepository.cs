using ExamService.Domain.Entities;
using ExamService.Domain.Repositories;
using ExamService.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace ExamService.Infrastructure.Repositories;

public class SemesterRepository : ISemesterRepository
{
    private readonly ExamDbContext _context;

    public SemesterRepository(ExamDbContext context)
    {
        _context = context;
    }

    public void Add(Semester semester)
    {
        _context.Semesters.Add(semester);
    }

    public async Task<List<Semester>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Semesters.ToListAsync(cancellationToken);
    }

    public async Task<Semester?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.Semesters
            .FirstOrDefaultAsync(s => s.SemesterCode == code, cancellationToken);
    }

    public async Task<Semester?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Semesters.FindAsync(new object[] { id }, cancellationToken);
    }

    public IQueryable<Semester> GetQueryable()
    {
        return _context.Semesters.AsQueryable();
    }

    public void Remove(Semester semester)
    {
        _context.Semesters.Remove(semester);
    }
}
