using GradingService.Application.Services;
using GradingService.Domain.Commons;
using GradingService.Domain.Entities;
using Microsoft.AspNetCore.Http;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Events;
using SharedLibrary.Common.Exceptions;
using SharedLibrary.Common.Repositories;
using SharedLibrary.Contracts;

namespace GradingService.Application.Submissions.Commands;

public sealed record UploadSubmissionBatchCommand(
    IFormFile RarFile,
    Guid ManagerId,
    Guid ExamId,
    Guid BatchId 
) : ICommand<Guid>;

public class UploadSubmissionBatchCommandHandler : ICommandHandler<UploadSubmissionBatchCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorageService;
    private readonly IEventPublisher _eventPublisher;
    private readonly IUploadProgressService _progressService;

    public UploadSubmissionBatchCommandHandler(
        IUnitOfWork unitOfWork,
        IFileStorageService fileStorageService,
        IEventPublisher eventPublisher,
        IUploadProgressService progressService)
    {
        _unitOfWork = unitOfWork;
        _fileStorageService = fileStorageService;
        _eventPublisher = eventPublisher;
        _progressService = progressService;
    }

    public async Task<Guid> Handle(UploadSubmissionBatchCommand command, CancellationToken cancellationToken)
    {
        var batchId = command.BatchId;

        try
        {
            // Stage 1: Validation (0-10%)
            await _progressService.ReportProgressAsync(
                batchId, 0, "Validate", "Validating exam...", cancellationToken);

            var examRepository = _unitOfWork.Repository<Exam>();
            var exam = await examRepository.GetByIdAsync(command.ExamId, cancellationToken);

            if (exam == null)
            {
                await _progressService.ReportErrorAsync(
                    batchId, $"Exam with Id '{command.ExamId}' not found.", cancellationToken);
                throw new BadRequestException($"Exam with Id '{command.ExamId}' not found.");
            }

            await _progressService.ReportProgressAsync(
                batchId, 10, "Validate", "Exam validated successfully", cancellationToken);

            // Stage 2: File Upload (10-60%)
            await _progressService.ReportProgressAsync(
                batchId, 15, "Upload", "Starting file upload...", cancellationToken);

            var filePath = await _fileStorageService.UploadAsync(
                    command.RarFile,
                    StorageBuckets.SubmissionBatches,
                    cancellationToken);

            await _progressService.ReportProgressAsync(
                batchId, 60, "Upload", "File uploaded successfully", cancellationToken);

            // Stage 3: Database Entry (60-80%)
            await _progressService.ReportProgressAsync(
                batchId, 65, "Process", "Creating batch record...", cancellationToken);

            var batchRepository = _unitOfWork.Repository<SubmissionBatch>();
            var submissionBatch = new SubmissionBatch
            {
                Id = batchId,
                RarFilePath = filePath,
                Status = SubmissionStatus.Pending,
                UploadedBy = command.ManagerId,
                ExamId = command.ExamId,
            };

            await batchRepository.AddAsync(submissionBatch, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await _progressService.ReportProgressAsync(
                batchId, 80, "Process", "Batch record created", cancellationToken);

            // Stage 4: Publishing Event (80-95%)
            await _progressService.ReportProgressAsync(
                batchId, 85, "Process", "Publishing processing event...", cancellationToken);

            var eventMessage = new SubmissionBatchUploadedEvent
            {
                SubmissionBatchId = submissionBatch.Id,
                RarFilePath = submissionBatch.RarFilePath,
                UploadedByManagerId = submissionBatch.UploadedBy,
                ForbiddenKeywords = exam.ForbiddenKeywords
            };

            await _eventPublisher.PublishAsync(eventMessage, cancellationToken);

            await _progressService.ReportProgressAsync(
                batchId, 95, "Process", "Event published successfully", cancellationToken);

            // Stage 5: Complete (100%)
            await _progressService.ReportProgressAsync(
                batchId, 100, "Complete", "Upload completed! Processing will begin shortly.", cancellationToken);

            await _progressService.ReportCompletedAsync(
                batchId, 0, cancellationToken);

            return submissionBatch.Id;
        }
        catch (Exception ex)
        {
            await _progressService.ReportErrorAsync(
                batchId, $"Upload failed: {ex.Message}", cancellationToken);
            throw;
        }
    }
}