namespace GradingService.Application.Dtos;

public class SubmissionDto
{
    public Guid Id { get; set; }
    public string StudentCode { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty; 
    public string FolderName { get; set; } = string.Empty;
    public Guid ExamId { get; set; }
    public string ExamCode { get; set; } = string.Empty;
    public Guid SubmissionBatchId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? GitHubRepositoryUrl { get; set; }
    public DateTime? CreatedAt { get; set; } 
    public Guid? ExaminerId { get; set; }
    public string? ExaminerName { get; set; }
    public DateTime? AssignedAt { get; set; }
}
