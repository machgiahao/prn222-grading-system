namespace GradingService.Application.Dtos;

public class BatchSummaryDto
{
    public Guid BatchId { get; set; }
    public string ExamCode { get; set; } = string.Empty;
    public string ExamName { get; set; } = string.Empty;
    public int TotalSubmissions { get; set; }
    public int GradedSubmissions { get; set; }
    public int PendingSubmissions { get; set; }
    public int ViolationCount { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public Guid? ApprovedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}