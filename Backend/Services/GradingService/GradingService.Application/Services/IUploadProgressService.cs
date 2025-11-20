namespace GradingService.Application.Services;

public interface IUploadProgressService
{
    Task ReportProgressAsync(Guid batchId, int percentage, string stage, string? message = null, CancellationToken cancellationToken = default);
    Task ReportErrorAsync(Guid batchId, string errorMessage, CancellationToken cancellationToken = default);
    Task ReportCompletedAsync(Guid batchId, int totalSubmissions, CancellationToken cancellationToken = default);
}
