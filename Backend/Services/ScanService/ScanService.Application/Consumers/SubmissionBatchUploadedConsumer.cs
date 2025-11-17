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
        _logger.LogInformation("[ScanService] Receive new batch for scanning: {BatchId}", message.SubmissionBatchId);

        ScanResult scanResult;
        try
        {
            _logger.LogInformation("Downloading file {FilePath} from bucket {Bucket}",
                message.RarFilePath,
                StorageBuckets.SubmissionBatches);

            using (var rarStream = await _minioDownloader.DownloadFileAsync(
                StorageBuckets.SubmissionBatches,
                message.RarFilePath,
                context.CancellationToken))
            {
                if (rarStream == null || rarStream.Length == 0)
                {
                    throw new InvalidOperationException("Failed to download file from MinIO (Stream was empty).");
                }

                _logger.LogInformation("Scanning archive for batch {BatchId}", message.SubmissionBatchId);

                scanResult = await _scanLogic.ScanRarFileAsync(
                    rarStream,
                    message.ForbiddenKeywords,
                    message.SubmissionBatchId);
            }

            _logger.LogInformation(
                "Scan completed successfully. Violations: {ViolationCount}, Students: {StudentCount}, Folders: {FolderCount}",
                scanResult.Violations.Count,
                scanResult.StudentCodes.Count,
                scanResult.StudentFolders.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[ScanService] Critical error scanning batch {BatchId}", message.SubmissionBatchId);

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
                StudentCodes = new List<string>(),
                StudentFolders = new Dictionary<string, string>()
            };
        }

        _logger.LogInformation(
            "Publishing ScanCompletedEvent for batch {BatchId} with {StudentCount} students",
            message.SubmissionBatchId,
            scanResult.StudentCodes.Count);

        var scanCompletedEvent = new ScanCompletedEvent
        {
            SubmissionBatchId = message.SubmissionBatchId,
            UploadedByManagerId = message.UploadedByManagerId,
            Violations = scanResult.Violations,
            StudentCodes = scanResult.StudentCodes,
            StudentFolders = scanResult.StudentFolders
        };

        await _eventPublisher.PublishAsync(scanCompletedEvent, context.CancellationToken);

        _logger.LogInformation(
            "ScanCompletedEvent published successfully for batch {BatchId}",
            message.SubmissionBatchId);
    }
}