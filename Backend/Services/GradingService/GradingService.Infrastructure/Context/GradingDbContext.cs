using GradingService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace GradingService.Infrastructure.Context;

public class GradingDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Rubric> Rubrics { get; set; }
    public DbSet<RubricItem> RubricItems { get; set; }
    public DbSet<SubmissionBatch> SubmissionBatches { get; set; }
    public DbSet<Exam> Exams { get; set; }
    public DbSet<Submission> Submissions { get; set; }
    public DbSet<Violation> Violations { get; set; }
    public DbSet<Grade> Grades { get; set; }
    public DbSet<GradedRubricItem> GradedRubricItems { get; set; }

    public GradingDbContext(DbContextOptions<GradingDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(modelBuilder);
    }
}
