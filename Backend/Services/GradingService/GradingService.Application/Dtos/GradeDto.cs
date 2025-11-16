namespace GradingService.Application.Dtos;

public class GradeDto
{
    public Guid SubmissionId { get; set; }
    public string? Comment { get; set; }  
    public List<GradedItemDto> GradedItems { get; set; }
}
