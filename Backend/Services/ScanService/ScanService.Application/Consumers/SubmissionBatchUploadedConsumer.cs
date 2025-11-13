using MassTransit;
using Microsoft.Extensions.Logging;
using ScanService.Application.Services;
using ScanService.Domain.Constants;
using SharedLibrary.Common.Events;
using SharedLibrary.Contracts;

namespace ScanService.Application.Consumers;

public class SubmissionBatchUploadedConsumer : IConsumer<SubmissionBatchUploadedEvent>
{
    private readonly IMinioDownloader _minioDownloader;
    private readonly IScanLogicService _scanLogic;
    private readonly IEventPublisher _eventPublisher;
    private readonly ILogger<SubmissionBatchUploadedConsumer> _logger;

    public SubmissionBatchUploadedConsumer(
        IMinioDownloader minioDownloader,
        IScanLogicService scanLogic,
        IEventPublisher eventPublisher,
        ILogger<SubmissionBatchUploadedConsumer> logger)
    {
        _minioDownloader = minioDownloader;
        _scanLogic = scanLogic;
        _eventPublisher = eventPublisher;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<SubmissionBatchUploadedEvent> context)
    {
        var message = context.Message;
        _logger.LogInformation($"[ScanService] Receive new batch for scanning: {message.SubmissionBatchId}");

        ScanResult scanResult;
        try
        {
            _logger.LogInformation($"...Downloading file {message.RarFilePath}");

            using (var rarStream = await _minioDownloader.DownloadFileAsync(
                StorageBuckets.SubmissionBatches,
                message.RarFilePath,
                context.CancellationToken))
            {
                if (rarStream == null || rarStream.Length == 0)
                {
                    throw new InvalidOperationException("Failed to download file from MinIO (Stream was empty).");
                }

                _logger.LogInformation($"...Scanning file");
                scanResult = await _scanLogic.ScanRarFileAsync(
                    rarStream,
                    message.ForbiddenKeywords,
                    message.SubmissionBatchId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"[ScanService] Failed to scan batch {message.SubmissionBatchId}.");
            scanResult = new ScanResult
            {
                Violations = new List<ScanResultItem>
            {
                new ScanResultItem
                {
                    StudentId = "SYSTEM_ERROR",
                    FilePath = message.RarFilePath,
                    ViolationType = ViolationTypes.ScanError,
                    Description = $"A critical scan error occurred: {ex.Message}"
                }
            },
                StudentCodes = new List<string>()
            };
        }

        _logger.LogInformation($"...Scan complete. Found {scanResult.Violations.Count} violations for {scanResult.StudentCodes.Count} students. Publishing ScanCompletedEvent.");

        var scanCompletedEvent = new ScanCompletedEvent
        {
            SubmissionBatchId = message.SubmissionBatchId,
            UploadedByManagerId = message.UploadedByManagerId,
            Violations = scanResult.Violations,
            StudentCodes = scanResult.StudentCodes
        };

        await _eventPublisher.PublishAsync(scanCompletedEvent, context.CancellationToken);
    }
}
