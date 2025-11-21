using GradingService.Application.Hubs;
using GradingService.Application.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace GradingService.Infrastructure.Services;

public class UploadProgressService : IUploadProgressService
{
    private readonly IHubContext<UploadProgressHub> _hubContext;
    private readonly ILogger<UploadProgressService> _logger;

    public UploadProgressService(
        IHubContext<UploadProgressHub> hubContext,
        ILogger<UploadProgressService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task ReportProgressAsync(
        Guid batchId,
        int percentage,
        string stage,
        string? message = null,
        CancellationToken cancellationToken = default)
    {
        var groupName = $"batch-{batchId}";

        _logger.LogInformation(
            "📊 Sending progress to group {GroupName}: {Percentage}% - {Stage}",
            groupName, percentage, stage);

        var progressData = new
        {
            BatchId = batchId,
            Percentage = percentage,
            Stage = stage,
            Message = message ?? $"Processing {stage}...",
            Timestamp = DateTime.UtcNow
        };

        try
        {
            await _hubContext.Clients
                .Group(groupName)
                .SendAsync("ReceiveProgress", progressData, cancellationToken);

            _logger.LogInformation("✅ Progress sent successfully to group {GroupName}", groupName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to send progress to group {GroupName}", groupName);
        }
    }

    public async Task ReportErrorAsync(
        Guid batchId,
        string errorMessage,
        CancellationToken cancellationToken = default)
    {
        var groupName = $"batch-{batchId}";

        _logger.LogError("❌ Sending error to group {GroupName}: {Error}", groupName, errorMessage);

        var errorData = new
        {
            BatchId = batchId,
            Error = errorMessage,
            Timestamp = DateTime.UtcNow
        };

        try
        {
            await _hubContext.Clients
                .Group(groupName)
                .SendAsync("ReceiveError", errorData, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to send error to group {GroupName}", groupName);
        }
    }

    public async Task ReportCompletedAsync(
        Guid batchId,
        int totalSubmissions,
        CancellationToken cancellationToken = default)
    {
        var groupName = $"batch-{batchId}";

        _logger.LogInformation(
            "✅ Sending completion to group {GroupName}: {Count} submissions",
            groupName, totalSubmissions);

        var completionData = new
        {
            BatchId = batchId,
            TotalSubmissions = totalSubmissions,
            CompletedAt = DateTime.UtcNow
        };

        try
        {
            await _hubContext.Clients
                .Group(groupName)
                .SendAsync("ReceiveCompletion", completionData, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to send completion to group {GroupName}", groupName);
        }
    }
}