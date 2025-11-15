namespace GradingService.Application.Dtos;

public class SubmissionTaskDto
{
    public Guid Id { get; set; }
    public string StudentCode { get; set; }
    public string Status { get; set; }
    public Guid SubmissionBatchId { get; set; }
}
