using GradingService.Domain.Abstractions;

namespace GradingService.Domain.Entities;

public class Violation : Entity<Guid>
{
    public Guid SubmissionId { get; set; } 
    public virtual Submission Submission { get; set; }

    public string ViolationType { get; set; }
    public string Details { get; set; }
    public double? SimilarityScore { get; set; }

    public string? ModeratorComment { get; set; }
    public bool? IsVerified { get; set; }
    public Guid? VerifiedBy { get; set; }
    public DateTime? VerifiedAt { get; set; }
}
