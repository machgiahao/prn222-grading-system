using GradingService.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace GradingService.API.Controllers;

[ApiController]
[Route("api/internal/progress")]
public class InternalProgressController : ControllerBase
{
    private readonly IUploadProgressService _progressService;

    public InternalProgressController(IUploadProgressService progressService)
    {
        _progressService = progressService;
    }

    [HttpPost("report")]
    public async Task<IActionResult> ReportProgress(
        [FromBody] ProgressReportRequest request)
    {
        await _progressService.ReportProgressAsync(
            request.BatchId,
            request.Percentage,
            request.Stage,
            request.Message,
            HttpContext.RequestAborted);

        return Ok();
    }

    [HttpPost("complete")]
    public async Task<IActionResult> ReportComplete(
        [FromBody] CompleteReportRequest request)
    {
        await _progressService.ReportCompletedAsync(
            request.BatchId,
            request.TotalSubmissions,
            HttpContext.RequestAborted);

        return Ok();
    }

    [HttpPost("error")]
    public async Task<IActionResult> ReportError(
        [FromBody] ErrorReportRequest request)
    {
        await _progressService.ReportErrorAsync(
            request.BatchId,
            request.Error,
            HttpContext.RequestAborted);

        return Ok();
    }
}

public record ProgressReportRequest(
    Guid BatchId,
    int Percentage,
    string Stage,
    string? Message);

public record CompleteReportRequest(
    Guid BatchId,
    int TotalSubmissions);

public record ErrorReportRequest(
    Guid BatchId,
    string Error);