namespace GradingService.API.Dtos;

public class UploadSubmissionBatchRequestDto
{
    public IFormFile RarFile { get; set; }
    public Guid ExamId { get; set; }
}
