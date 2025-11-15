namespace GradingService.Application.Dtos;

public class GradingDetailsDto
{
    public Guid SubmissionId { get; set; }
    public string StudentCode { get; set; }
    public string OriginalFileName { get; set; }
    public string Status { get; set; }

    public List<RubricItemDto> RubricItems { get; set; }
}
