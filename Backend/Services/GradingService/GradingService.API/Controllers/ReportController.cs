using GradingService.API.Common.Constants;
using GradingService.Application.Reports;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Common.Constants;

namespace GradingService.API.Controllers;

[ApiController]
[Route(ApiRoutes.Reports.Base)]
[Authorize(Roles = SystemRoles.Admin)]
public class ReportController : ControllerBase
{
    private readonly ISender _sender;

    public ReportController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet(ApiRoutes.Reports.ExportBatchReport)]
    public async Task<IActionResult> ExportBatchReport(Guid batchId)
    {
        var query = new ExportBatchReportQuery(batchId);
        var fileBytes = await _sender.Send(query);

        var fileName = $"GradingReport_Batch_{batchId}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";

        return File(fileBytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileName);
    }
}