namespace GradingService.API.Dtos;

public class AssignSubmissionRequestDto
{
    public Guid SubmissionId { get; set; }
    public Guid ExaminerId { get; set; }
}
