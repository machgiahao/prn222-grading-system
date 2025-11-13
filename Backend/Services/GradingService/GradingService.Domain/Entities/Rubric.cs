using GradingService.Domain.Abstractions;

namespace GradingService.Domain.Entities;

public class Rubric : Entity<Guid>
{
    public string Title { get; set; }
    public virtual ICollection<RubricItem> Items { get; set; }

    public Guid ExamId { get; set; }
    public virtual Exam Exam { get; set; }
}

