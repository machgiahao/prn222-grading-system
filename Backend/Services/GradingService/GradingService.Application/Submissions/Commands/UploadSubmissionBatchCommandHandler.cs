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
    Guid ExamId
 ) : ICommand<Guid>;

public class UploadSubmissionBatchCommandHandler : ICommandHandler<UploadSubmissionBatchCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorageService;
    private readonly IEventPublisher _eventPublisher;

    public UploadSubmissionBatchCommandHandler(
        IUnitOfWork unitOfWork,
        IFileStorageService fileStorageService,
        IEventPublisher eventPublisher)
    {
        _unitOfWork = unitOfWork;
        _fileStorageService = fileStorageService;
        _eventPublisher = eventPublisher;
    }

    public async Task<Guid> Handle(UploadSubmissionBatchCommand command, CancellationToken cancellationToken)
    {
        var examRepository = _unitOfWork.Repository<Exam>();
        var exam = await examRepository.GetByIdAsync(command.ExamId, cancellationToken);

        if (exam == null)
        {
            throw new BadRequestException($"Exam with Id '{command.ExamId}' not found.");
        }

        var filePath = await _fileStorageService.UploadAsync(
                command.RarFile,
                StorageBuckets.SubmissionBatches,
                cancellationToken);

        var batchRepository = _unitOfWork.Repository<SubmissionBatch>();
        var submissionBatch = new SubmissionBatch
        {
            RarFilePath = filePath,
            Status = SubmissionStatus.Pending,
            UploadedBy = command.ManagerId,
            ExamId = command.ExamId,
        };

        await batchRepository.AddAsync(submissionBatch, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var eventMessage = new SubmissionBatchUploadedEvent
        {
            SubmissionBatchId = submissionBatch.Id,
            RarFilePath = submissionBatch.RarFilePath,
            UploadedByManagerId = submissionBatch.UploadedBy,
            ForbiddenKeywords = exam.ForbiddenKeywords
        };

        await _eventPublisher.PublishAsync(eventMessage, cancellationToken);
        return submissionBatch.Id;
    }
}
