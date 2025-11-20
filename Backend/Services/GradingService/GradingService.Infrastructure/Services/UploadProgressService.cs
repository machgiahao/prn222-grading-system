using GradingService.Application.Hubs;
using GradingService.Application.Services;
using Microsoft.AspNetCore.SignalR;

namespace GradingService.Infrastructure.Services;

public class UploadProgressService : IUploadProgressService
{
    private readonly IHubContext<UploadProgressHub> _hubContext;

    public UploadProgressService(IHubContext<UploadProgressHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task ReportProgressAsync(
        Guid batchId,
        int percentage,
        string stage,
        string? message = null,
        CancellationToken cancellationToken = default)
    {
        var progressData = new
        {
            BatchId = batchId,
            Percentage = percentage,
            Stage = stage,
            Message = message ?? GetDefaultMessage(stage, percentage),
            Timestamp = DateTime.UtcNow
        };

        await _hubContext.Clients
            .Group($"batch-{batchId}")
            .SendAsync("ReceiveProgress", progressData, cancellationToken);
    }

    public async Task ReportErrorAsync(
        Guid batchId,
        string errorMessage,
        CancellationToken cancellationToken = default)
    {
        var errorData = new
        {
            BatchId = batchId,
            Error = errorMessage,
            Timestamp = DateTime.UtcNow
        };

        await _hubContext.Clients
            .Group($"batch-{batchId}")
            .SendAsync("ReceiveError", errorData, cancellationToken);
    }

    public async Task ReportCompletedAsync(
        Guid batchId,
        int totalSubmissions,
        CancellationToken cancellationToken = default)
    {
        var completionData = new
        {
            BatchId = batchId,
            TotalSubmissions = totalSubmissions,
            CompletedAt = DateTime.UtcNow
        };

        await _hubContext.Clients
            .Group($"batch-{batchId}")
            .SendAsync("ReceiveCompletion", completionData, cancellationToken);
    }

    private static string GetDefaultMessage(string stage, int percentage)
    {
        return stage switch
        {
            "Upload" => $"Uploading file... {percentage}%",
            "Extract" => $"Extracting archive... {percentage}%",
            "Validate" => $"Validating submissions... {percentage}%",
            "Process" => $"Processing submissions... {percentage}%",
            "Complete" => "Processing completed!",
            _ => $"Processing... {percentage}%"
        };
    }
}
