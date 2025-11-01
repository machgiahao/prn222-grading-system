using ExamService.Domain.Entities;
using ExamService.Domain.Repositories;
using ExamService.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace ExamService.Infrastructure.Repositories;

public class SubjectRepository : ISubjectRepository
{
    private readonly ExamDbContext _context;

    public SubjectRepository(ExamDbContext context)
    {
        _context = context;
    }

    public void Add(Subject subject)
    {
        _context.Subjects.Add(subject);
    }

    public async Task<List<Subject>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Subjects.ToListAsync(cancellationToken);
    }

    public async Task<Subject?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.Subjects
            .FirstOrDefaultAsync(s => s.SubjectCode == code, cancellationToken);
    }

    public async Task<Subject?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Subjects.FindAsync(new object[] { id }, cancellationToken);
    }

    public IQueryable<Subject> GetQueryable()
    {
        return _context.Subjects.AsQueryable();
    }

    public void Remove(Subject subject)
    {
        _context.Subjects.Remove(subject);
    }
}
