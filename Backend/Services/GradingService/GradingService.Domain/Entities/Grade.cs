using GradingService.Domain.Abstractions;
using System.ComponentModel.DataAnnotations.Schema;

namespace GradingService.Domain.Entities;

public class Grade : Entity<Guid>
{
    public Guid SubmissionId { get; set; }
    public virtual Submission Submission { get; set; }

    public Guid ExaminerId { get; set; }
    public virtual User Examiner { get; set; }

    public string? Comment { get; set; }

    [NotMapped]
    public double TotalScore => GradedRubricItems?.Sum(item => item.Score) ?? 0;

    public virtual ICollection<GradedRubricItem> GradedRubricItems { get; set; }
}
