using GradingService.Domain.Abstractions;

namespace GradingService.Domain.Entities;

public class User : Entity<Guid>
{
    public string Name { get; set; }
    public string Email { get; set; }

    public virtual ICollection<SubmissionBatch> SubmissionBatchs { get; set; }
    public virtual ICollection<Submission> Submissions { get; set; }
    public virtual ICollection<Grade> Grades { get; set; }
}
