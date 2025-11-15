using GradingService.API.Common.Constants;
using GradingService.API.Dtos;
using GradingService.Application.Submissions.Commands;
using GradingService.Application.Submissions.Queries;
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

    [HttpPost(ApiRoutes.Submissions.Assign)]
    [Authorize(Roles = SystemRoles.Manager)]
    public async Task<IActionResult> AssignSubmission(
        [FromBody] AssignSubmissionRequestDto request)
    {
        if (request.SubmissionId == Guid.Empty || request.ExaminerId == Guid.Empty)
        {
            throw new BadRequestException("SubmissionId and ExaminerId are required.");
        }

        var command = new AssignSubmissionCommand(request.SubmissionId, request.ExaminerId);

        await _sender.Send(command);

        return Ok(new { Message = "Submission assigned successfully." });
    }

    [HttpPost(ApiRoutes.Submissions.AutoAssign)]
    [Authorize(Roles = SystemRoles.Manager)]
    public async Task<IActionResult> AutoAssignBatch(
        [FromBody] AutoAssignBatchRequestDto request)
    {
        if (request.SubmissionBatchId == Guid.Empty)
        {
            throw new BadRequestException("SubmissionBatchId is required.");
        }
        if (request.ExaminerIds == null || !request.ExaminerIds.Any())
        {
            throw new BadRequestException("At least one ExaminerId is required.");
        }

        var command = new AutoAssignBatchCommand(request.SubmissionBatchId, request.ExaminerIds);

        var assignedCount = await _sender.Send(command);

        return Ok(new
        {
            Message = "Batch auto-assignment completed.",
            AssignedSubmissionCount = assignedCount
        });
    }

    [HttpGet(ApiRoutes.Submissions.MyTasks)]
    [Authorize(Roles = SystemRoles.Examiner)]
    public async Task<IActionResult> GetMyTasks()
    {
        var examinerIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(examinerIdString, out Guid examinerId))
        {
            throw new UnauthorizedException("User ID claim is missing or invalid in the token.");
        }
        var query = new GetMyTasksQuery(examinerId);
        var result = await _sender.Send(query);

        return Ok(result);
    }

    [HttpGet(ApiRoutes.Submissions.GradingDetails)]
    [Authorize(Roles = SystemRoles.Examiner)] 
    public async Task<IActionResult> GetGradingDetails(Guid id)
    {
        var query = new GetGradingDetailsQuery(id);
        var result = await _sender.Send(query);

        return Ok(result);
    }
}
