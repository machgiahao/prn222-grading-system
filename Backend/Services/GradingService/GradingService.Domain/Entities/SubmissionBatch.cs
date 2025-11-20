using GradingService.Domain.Abstractions;

namespace GradingService.Domain.Entities;

public class SubmissionBatch : Entity<Guid>
{
    public string RarFilePath { get; set; }
    public string Status { get; set; }
    public Guid UploadedBy { get; set; }
    public virtual User UploadedByManager { get; set; }

    public Guid ExamId { get; set; }
    public virtual Exam Exam { get; set; }
    public virtual ICollection<Submission> Submissions { get; set; }

    public bool IsApproved { get; set; }
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
}
