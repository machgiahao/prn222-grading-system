using GradingService.API.Common.Constants;
using GradingService.Application.Dtos;
using GradingService.Application.Submissions.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Common.Constants;
using System.Security.Claims;

namespace GradingService.API.Controllers;

[ApiController]
[Route(ApiRoutes.Grades.Base)]
public class GradeController : ControllerBase
{
    private readonly ISender _sender;

    public GradeController(ISender sender) 
    {
        _sender = sender;
    }

    [HttpPost]
    [Authorize(Roles = SystemRoles.Examiner)]
    public async Task<IActionResult> SubmitGrade(
            [FromBody] GradeDto request)
    {
        var examinerIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(examinerIdString, out Guid examinerId))
        {
            throw new UnauthorizedAccessException("User ID claim is missing or invalid.");
        }

        var command = new SubmitGradeCommand(
            request.SubmissionId,
            request.Comment,
            request.GradedItems,
            examinerId
        );

        await _sender.Send(command);
        return Ok(new { Message = "Grade submitted successfully." });
    }
}
