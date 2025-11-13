using GradingService.Domain.Abstractions;

namespace GradingService.Domain.Entities;

public class Violation : Entity<Guid>
{
    public Guid SubmissionId { get; set; } // FK
    public virtual Submission Submission { get; set; }

    public string ViolationType { get; set; }
    public string Details { get; set; }
    public double? SimilarityScore { get; set; }
}
