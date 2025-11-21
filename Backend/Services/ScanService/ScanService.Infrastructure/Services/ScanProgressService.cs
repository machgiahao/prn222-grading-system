using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ScanService.Application.Services;
using System.Net.Http.Json;

namespace ScanService.Infrastructure.Services;

public class ScanProgressService : IScanProgressService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ScanProgressService> _logger;
    private readonly string _gradingServiceUrl;

    public ScanProgressService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<ScanProgressService> logger)
    {
        _httpClient = httpClientFactory.CreateClient("GradingService");
        _logger = logger;
        _gradingServiceUrl = configuration["GradingServiceUrl"] ?? "https://localhost:7002";
    }

    public async Task ReportProgressAsync(
        Guid batchId,
        int percentage,
        string stage,
        string? message = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var payload = new
            {
                batchId,
                percentage,
                stage,
                message = message ?? $"Scanning - {stage}",
                timestamp = DateTime.UtcNow
            };

            _logger.LogInformation(
                "📊 Reporting scan progress to GradingService: {Percentage}% - {Stage}",
                percentage, stage);

            var response = await _httpClient.PostAsJsonAsync(
                $"{_gradingServiceUrl}/api/internal/progress/report",
                payload,
                cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Failed to report progress: {StatusCode}",
                    response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reporting scan progress");
        }
    }

    public async Task ReportCompletedAsync(
        Guid batchId,
        int totalSubmissions,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var payload = new
            {
                batchId,
                totalSubmissions,
                completedAt = DateTime.UtcNow
            };

            _logger.LogInformation(
                "✅ Reporting scan completion: {Count} submissions",
                totalSubmissions);

            var response = await _httpClient.PostAsJsonAsync(
                $"{_gradingServiceUrl}/api/internal/progress/complete",
                payload,
                cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Failed to report completion: {StatusCode}",
                    response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reporting scan completion");
        }
    }

    public async Task ReportErrorAsync(
        Guid batchId,
        string errorMessage,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var payload = new
            {
                batchId,
                error = errorMessage,
                timestamp = DateTime.UtcNow
            };

            _logger.LogError("❌ Reporting scan error: {Error}", errorMessage);

            var response = await _httpClient.PostAsJsonAsync(
                $"{_gradingServiceUrl}/api/internal/progress/error",
                payload,
                cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Failed to report error: {StatusCode}",
                    response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reporting scan error");
        }
    }
}