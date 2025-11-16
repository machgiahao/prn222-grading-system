using System.ComponentModel.DataAnnotations;

namespace GradingService.API.Dtos;

public class VerifyViolationRequestDto
{
    [Required]
    public Guid SubmissionId { get; set; }

    [Required]
    public bool IsViolationConfirmed { get; set; }

    public string? ModeratorComment { get; set; }
}
