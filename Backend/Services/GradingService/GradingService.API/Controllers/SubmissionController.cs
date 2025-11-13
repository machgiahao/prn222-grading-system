using GradingService.API.Common.Constants;
using GradingService.API.Dtos;
using GradingService.Application.Submissions.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Common.Constants;
using SharedLibrary.Common.Exceptions;
using System.Security.Claims;

namespace GradingService.API.Controllers;

[ApiController]
[Route(ApiRoutes.Submissions.Base)]
public class SubmissionController : ControllerBase
{
    private readonly ISender _sender;

    public SubmissionController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost(ApiRoutes.Submissions.Upload)]
    [Authorize(Roles = SystemRoles.Manager)]
    public async Task<IActionResult> UploadSubmissionBatch(
        [FromForm] UploadSubmissionBatchRequestDto request)
    {
        if (request.RarFile == null || request.RarFile.Length == 0)
        {
            throw new BadRequestException("File is required.");
        }
        if (request.ExamId == Guid.Empty)
        {
            throw new BadRequestException("ExamId is required.");
        }

        var managerId = Guid.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)
        );

        var command = new UploadSubmissionBatchCommand(
            request.RarFile,
            managerId,
            request.ExamId
        );

        var batchId = await _sender.Send(command);
        return Accepted(new { PendingBatchId = batchId });
    }
}
