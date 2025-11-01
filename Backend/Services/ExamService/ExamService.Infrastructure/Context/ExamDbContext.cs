using ExamService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace ExamService.Infrastructure.Context;

public class ExamDbContext : DbContext
{
    public DbSet<Subject> Subjects { get; set; }
    public DbSet<Semester> Semesters { get; set; }

    public ExamDbContext(DbContextOptions<ExamDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(modelBuilder);
    }
}
