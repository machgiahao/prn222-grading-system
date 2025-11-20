namespace GradingService.Application.Dtos;

public class ReportSummaryDto
{
    public List<BatchSummaryDto> Batches { get; set; } = new();
    public int TotalBatches { get; set; }
    public int CompletedBatches { get; set; }
    public int PendingApprovalBatches { get; set; }
    public int TotalSubmissions { get; set; }
    public int TotalViolations { get; set; }
}
