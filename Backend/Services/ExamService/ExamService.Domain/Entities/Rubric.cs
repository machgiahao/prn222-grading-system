using ExamService.Domain.Abstractions;

namespace ExamService.Domain.Entities;

public class Rubric : Entity<Guid>
{
    public Guid ExamId { get; set; }
    public virtual Exam Exam { get; set; }

    public virtual ICollection<RubricItem> Items { get; set; } = new List<RubricItem>();
}
