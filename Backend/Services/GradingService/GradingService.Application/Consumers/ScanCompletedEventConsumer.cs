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
        _logger.LogInformation("📨 Received scan results for Batch: {BatchId}", message.SubmissionBatchId);

        if (!await ValidateBatchExistsAsync(message.SubmissionBatchId, context.CancellationToken))
        {
            return;
        }

        await CreateSubmissionsAsync(message, context.CancellationToken);

        var hasViolations = message.Violations?.Any() ?? false;
        if (!hasViolations)
        {
            await HandleCleanBatchAsync(message.SubmissionBatchId, context.CancellationToken);
            return;
        }

        await ProcessViolationsAsync(message, context.CancellationToken);
    }

    private async Task<bool> ValidateBatchExistsAsync(Guid batchId, CancellationToken cancellationToken)
    {
        var batchRepo = _unitOfWork.Repository<SubmissionBatch>();
        var batch = await batchRepo.GetByIdAsync(batchId, cancellationToken);

        if (batch == null)
        {
            _logger.LogError("SubmissionBatch {BatchId} not found", batchId);
            return false;
        }

        return true;
    }

    private async Task CreateSubmissionsAsync(ScanCompletedEvent message, CancellationToken cancellationToken)
    {
        if (message.StudentCodes == null || !message.StudentCodes.Any())
        {
            _logger.LogWarning("No student codes found for batch {BatchId}", message.SubmissionBatchId);
            return;
        }

        var submissionRepo = _unitOfWork.Repository<Submission>();
        var submissions = message.StudentCodes.Select(studentCode =>
        {
            var folderName = message.StudentFolders?.GetValueOrDefault(studentCode) ?? studentCode;
            var githubUrl = message.GitHubUrls?.GetValueOrDefault(studentCode); // Get GitHub URL

            return new Submission
            {
                StudentCode = studentCode,
                FolderName = folderName,
                SubmissionBatchId = message.SubmissionBatchId,
                Status = SubmissionStatus.Pending,
                OriginalFileName = $"{folderName}/solution.zip",
                GitHubRepositoryUrl = githubUrl
            };
        }).ToList();

        await submissionRepo.AddRangeAsync(submissions, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created {Count} submissions with {GitHubCount} GitHub URLs",
            submissions.Count,
            submissions.Count(s => !string.IsNullOrEmpty(s.GitHubRepositoryUrl)));
    }

    private async Task HandleCleanBatchAsync(Guid batchId, CancellationToken cancellationToken)
    {
        _logger.LogInformation("No violations found for batch {BatchId}", batchId);

        var submissionRepo = _unitOfWork.Repository<Submission>();
        var submissions = (await submissionRepo.FindAsync(
            s => s.SubmissionBatchId == batchId && s.Status == SubmissionStatus.Pending,
            cancellationToken
        )).ToList();

        foreach (var submission in submissions)
        {
            submission.Status = SubmissionStatus.ReadyToGrade;
            submissionRepo.Update(submission);
        }

        await UpdateBatchStatusAsync(batchId, BatchStatus.Scanned_Clean, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Updated {Count} submissions to ReadyToGrade", submissions.Count);
    }

    private async Task ProcessViolationsAsync(ScanCompletedEvent message, CancellationToken cancellationToken)
    {
        var hasSystemError = message.Violations.Any(v => v.StudentId == "SYSTEM_ERROR");
        if (hasSystemError)
        {
            _logger.LogError("System-level error reported for batch {BatchId}", message.SubmissionBatchId);
        }

        var violationsByStudent = message.Violations
            .Where(v => !string.IsNullOrEmpty(v.StudentId) && v.StudentId != "SYSTEM_ERROR")
            .GroupBy(v => v.StudentId)
            .ToList();

        _logger.LogInformation("Processing {ViolationCount} violations across {StudentCount} students",
            message.Violations.Count, violationsByStudent.Count);

        var updatedCount = await ProcessStudentViolationsAsync(
            message.SubmissionBatchId,
            violationsByStudent,
            cancellationToken);

        await UpdateCleanSubmissionsAsync(message.SubmissionBatchId, cancellationToken);

        var finalStatus = hasSystemError ? BatchStatus.Scanned_Error : BatchStatus.Scanned_Violations;
        await UpdateBatchStatusAsync(message.SubmissionBatchId, finalStatus, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Finished processing batch {BatchId}. Updated {Count} submissions",
            message.SubmissionBatchId, updatedCount);
    }

    private async Task<int> ProcessStudentViolationsAsync(
        Guid batchId,
        List<IGrouping<string, ScanResultItem>> violationsByStudent,
        CancellationToken cancellationToken)
    {
        var submissionRepo = _unitOfWork.Repository<Submission>();
        var violationRepo = _unitOfWork.Repository<Violation>();
        var updatedCount = 0;

        foreach (var studentGroup in violationsByStudent)
        {
            var studentId = studentGroup.Key;

            try
            {
                var submission = (await submissionRepo.FindAsync(
                    s => s.SubmissionBatchId == batchId && s.StudentCode == studentId,
                    cancellationToken
                )).FirstOrDefault();

                if (submission == null)
                {
                    _logger.LogWarning("Submission not found for student {StudentId}", studentId);
                    continue;
                }

                submission.Status = SubmissionStatus.Flagged;
                submissionRepo.Update(submission);

                var violations = studentGroup.Select(v => new Violation
                {
                    SubmissionId = submission.Id,
                    ViolationType = v.ViolationType,
                    Details = $"{v.Description} (in file: {v.FilePath})"
                }).ToList();

                await violationRepo.AddRangeAsync(violations, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                updatedCount++;
                _logger.LogInformation("Saved {Count} violations for student {StudentId}",
                    violations.Count, studentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save violations for student {StudentId}", studentId);
            }
        }

        return updatedCount;
    }

    private async Task UpdateCleanSubmissionsAsync(Guid batchId, CancellationToken cancellationToken)
    {
        var submissionRepo = _unitOfWork.Repository<Submission>();
        var cleanSubmissions = (await submissionRepo.FindAsync(
            s => s.SubmissionBatchId == batchId && s.Status == SubmissionStatus.Pending,
            cancellationToken
        )).ToList();

        if (!cleanSubmissions.Any())
        {
            return;
        }

        foreach (var submission in cleanSubmissions)
        {
            submission.Status = SubmissionStatus.ReadyToGrade;
            submissionRepo.Update(submission);
        }

        _logger.LogInformation("Updated {Count} clean submissions to ReadyToGrade", cleanSubmissions.Count);
    }

    private async Task UpdateBatchStatusAsync(Guid batchId, string status, CancellationToken cancellationToken)
    {
        try
        {
            var batchRepo = _unitOfWork.Repository<SubmissionBatch>();
            var batch = await batchRepo.GetByIdAsync(batchId, cancellationToken);

            if (batch == null)
            {
                _logger.LogError("SubmissionBatch {BatchId} not found for status update", batchId);
                return;
            }

            batch.Status = status;
            batchRepo.Update(batch);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update status for batch {BatchId}", batchId);
        }
    }
}