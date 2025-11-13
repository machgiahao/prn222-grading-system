using GradingService.Domain.Abstractions;

namespace GradingService.Domain.Entities;

public class Exam : Entity<Guid>
{
    public string ExamCode { get; set; }
    public List<string> ForbiddenKeywords { get; set; } = new List<string>();
    public Guid RubricId { get; set; }
    public virtual Rubric Rubric { get; set; }
    public virtual ICollection<SubmissionBatch> Batches { get; set; }
}
