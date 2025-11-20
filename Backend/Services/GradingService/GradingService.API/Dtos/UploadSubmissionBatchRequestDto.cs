namespace GradingService.API.Dtos;

public class UploadSubmissionBatchRequestDto
{
    public IFormFile RarFile { get; set; } = null!;
    public Guid ExamId { get; set; }
    public Guid BatchId { get; set; } = Guid.Empty;
}