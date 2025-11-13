using GradingService.Domain.Commons;
using GradingService.Domain.Entities;
using MassTransit;
using Microsoft.Extensions.Logging;
using SharedLibrary.Common.Repositories;
using SharedLibrary.Contracts;

namespace GradingService.Application.Consumers;

public class ScanCompletedEventConsumer : IConsumer<ScanCompletedEvent>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ScanCompletedEventConsumer> _logger;

    public ScanCompletedEventConsumer(IUnitOfWork unitOfWork, ILogger<ScanCompletedEventConsumer> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ScanCompletedEvent> context)
    {
        var message = context.Message;
        _logger.LogInformation($"[GradingService] Received scan results for Batch: {message.SubmissionBatchId}...");

        var submissionRepo = _unitOfWork.Repository<Submission>();
        var violationRepo = _unitOfWork.Repository<Violation>();
        var batchRepo = _unitOfWork.Repository<SubmissionBatch>();

        // Get the SubmissionBatch to verify it exists
        var submissionBatch = await batchRepo.GetByIdAsync(message.SubmissionBatchId, context.CancellationToken);
        if (submissionBatch == null)
        {
            _logger.LogError($"SubmissionBatch {message.SubmissionBatchId} not found. Cannot create submissions.");
            return;
        }

        // Create submissions for all student codes in the batch
        _logger.LogInformation($"Creating {message.StudentCodes?.Count ?? 0} submissions...");

        if (message.StudentCodes != null && message.StudentCodes.Any())
        {
            foreach (var studentCode in message.StudentCodes)
            {
                var submission = new Submission
                {
                    StudentCode = studentCode,
                    SubmissionBatchId = message.SubmissionBatchId,
                    Status = SubmissionStatus.Pending,
                    OriginalFileName = $"{studentCode}/solution.zip"
                };

                await submissionRepo.AddAsync(submission, context.CancellationToken);
            }

            // Save submissions
            await _unitOfWork.SaveChangesAsync(context.CancellationToken);
            _logger.LogInformation($"Created {message.StudentCodes.Count} submissions successfully.");
        }

        // Handle VIOLATIONS
        if (message.Violations == null || !message.Violations.Any())
        {
            _logger.LogInformation($"No violations found for batch {message.SubmissionBatchId}.");
            await UpdateBatchStatus(message.SubmissionBatchId, BatchStatus.Scanned_Clean, context.CancellationToken);
            await _unitOfWork.SaveChangesAsync(context.CancellationToken);
            return;
        }

        var violationsByStudent = message.Violations
            .Where(v => v.StudentId != null && v.StudentId != "SYSTEM_ERROR")
            .GroupBy(v => v.StudentId);

        _logger.LogInformation($"Found {message.Violations.Count} total violations, grouped into {violationsByStudent.Count()} students.");

        int updatedSubmissions = 0;
        bool hasSystemError = message.Violations.Any(v => v.StudentId == "SYSTEM_ERROR");

        if (hasSystemError)
        {
            _logger.LogError($"A system-level error was reported by ScanService for batch {message.SubmissionBatchId}.");
        }

        // UPDATE SUBMISSIONS + ADD VIOLATIONS
        foreach (var studentGroup in violationsByStudent)
        {
            var studentId = studentGroup.Key;
            var violationCount = studentGroup.Count();

            _logger.LogWarning($"Processing {violationCount} violations for Student: {studentId}.");

            try
            {
                // find the corresponding submission
                var submission = (await submissionRepo.FindAsync(
                    s => s.SubmissionBatchId == message.SubmissionBatchId && s.StudentCode == studentId,
                    context.CancellationToken
                )).FirstOrDefault();

                if (submission != null)
                {
                    // Update submission status to 'Flagged'
                    submission.Status = SubmissionStatus.Flagged;
                    submissionRepo.Update(submission);

                    // Add each violation record
                    foreach (var scanItem in studentGroup)
                    {
                        var newViolation = new Violation
                        {
                            SubmissionId = submission.Id,
                            ViolationType = scanItem.ViolationType,
                            Details = $"{scanItem.Description} (in file: {scanItem.FilePath})"
                        };

                        await violationRepo.AddAsync(newViolation, context.CancellationToken);
                    }

                    // Save each student submission's violations
                    await _unitOfWork.SaveChangesAsync(context.CancellationToken);
                    updatedSubmissions++;

                    _logger.LogInformation($"Successfully saved {violationCount} violations for Student: {studentId}");
                }
                else
                {
                    _logger.LogError($"Could not find Submission entry for StudentId {studentId} in Batch {message.SubmissionBatchId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to save violations for StudentId {studentId} in Batch {message.SubmissionBatchId}. Continuing with others...");
            }
        }

        // UPDATE BATCH STATUS
        try
        {
            var finalBatchStatus = hasSystemError ? BatchStatus.Scanned_Error : BatchStatus.Scanned_Violations;
            await UpdateBatchStatus(message.SubmissionBatchId, finalBatchStatus, context.CancellationToken);
            await _unitOfWork.SaveChangesAsync(context.CancellationToken);

            _logger.LogInformation($"[GradingService] Finished processing batch {message.SubmissionBatchId}. Updated {updatedSubmissions} submissions with violations.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to save final batch status for {message.SubmissionBatchId}.");
        }
    }

    private async Task UpdateBatchStatus(Guid batchId, string status, CancellationToken cancellationToken)
    {
        try
        {
            var batchRepo = _unitOfWork.Repository<SubmissionBatch>();

            var batch = await batchRepo.GetByIdAsync(batchId, cancellationToken);
            if (batch != null)
            {
                batch.Status = status;
                batchRepo.Update(batch);
            }
            else
            {
                _logger.LogError($"Could not find SubmissionBatch {batchId} to update status.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to update status for SubmissionBatch {batchId}.");
        }
    }
}