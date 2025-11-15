using GradingService.Domain.Abstractions;

namespace GradingService.Domain.Entities;

public class Submission : Entity<Guid>
{
    public string StudentCode { get; set; }
    public string OriginalFileName { get; set; }
    public string Status { get; set; } 

    public Guid SubmissionBatchId { get; set; }
    public virtual SubmissionBatch Batch { get; set; }

    public Guid? ExaminerId { get; set; }
    public virtual User? Examiner { get; set; }

    public virtual ICollection<Violation> Violations { get; set; }
    public virtual ICollection<Grade> Grades { get; set; }
}
