namespace GradingService.API.Dtos;

public class AutoAssignBatchRequestDto
{
    public Guid SubmissionBatchId { get; set; }

    public List<Guid> ExaminerIds { get; set; }
}
