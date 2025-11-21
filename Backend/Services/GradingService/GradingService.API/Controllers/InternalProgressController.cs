using GradingService.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace GradingService.API.Controllers;

[ApiController]
[Route("api/internal/progress")]
public class InternalProgressController : ControllerBase
{
    private readonly IUploadProgressService _progressService;
    private readonly ILogger<InternalProgressController> _logger; // Add logger

    public InternalProgressController(
        IUploadProgressService progressService,
        ILogger<InternalProgressController> logger) // Inject logger
    {
        _progressService = progressService;
        _logger = logger;
    }

    [HttpPost("report")]
    public async Task<IActionResult> ReportProgress(
        [FromBody] ProgressReportRequest request)
    {
        _logger.LogInformation(
            "Received progress report from ScanService: {BatchId} - {Percentage}% - {Stage}",
            request.BatchId, request.Percentage, request.Stage);

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
        _logger.LogInformation(
            "Received completion report from ScanService: {BatchId} - {TotalSubmissions} submissions",
            request.BatchId, request.TotalSubmissions);

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
        _logger.LogError(
            "Received error report from ScanService: {BatchId} - {Error}",
            request.BatchId, request.Error);

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