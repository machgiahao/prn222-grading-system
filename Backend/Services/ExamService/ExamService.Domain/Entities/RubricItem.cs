using ExamService.Domain.Abstractions;

namespace ExamService.Domain.Entities;

public class RubricItem : Entity<Guid>
{
    public string Criteria { get; set; }
    public double MaxScore { get; set; }

    public Guid RubricId { get; set; }
    public virtual Rubric Rubric { get; set; }
}
