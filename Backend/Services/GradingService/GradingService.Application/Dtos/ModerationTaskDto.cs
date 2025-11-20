namespace GradingService.Application.Dtos;


public class ModerationTaskDto
{
    public Guid Id { get; set; }
    public string StudentCode { get; set; }
    public string Status { get; set; }
    public string? GitHubRepositoryUrl { get; set; }
    public Guid SubmissionBatchId { get; set; }
    public string BatchName { get; set; } 
    public int ViolationCount { get; set; }
    public List<ViolationDetailDto> Violations { get; set; } 
}

public class ViolationDetailDto
{
    public Guid Id { get; set; }
    public string ViolationType { get; set; }
    public string Details { get; set; }
    public double? SimilarityScore { get; set; }
}