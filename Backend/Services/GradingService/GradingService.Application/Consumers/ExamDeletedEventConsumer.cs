using GradingService.Domain.Entities;
using MassTransit;
using Microsoft.Extensions.Logging;
using SharedLibrary.Common.Repositories;
using SharedLibrary.Contracts;

namespace GradingService.Application.Consumers;

public class ExamDeletedEventConsumer : IConsumer<ExamDeletedEvent>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ExamDeletedEventConsumer> _logger;

    public ExamDeletedEventConsumer(
        IUnitOfWork unitOfWork,
        ILogger<ExamDeletedEventConsumer> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ExamDeletedEvent> context)
    {
        var @event = context.Message;
        _logger.LogInformation("Consuming ExamDeletedEvent for ExamId: {ExamId}", @event.ExamId);

        var examRepo = _unitOfWork.Repository<Exam>();
        var existingExams = await examRepo.FindAsync(
            e => e.Id == @event.ExamId,
            context.CancellationToken);

        var exam = existingExams.FirstOrDefault();

        if (exam == null)
        {
            _logger.LogWarning("Exam {ExamId} not found in GradingService. Already deleted or never existed.", @event.ExamId);
            return;
        }

        // Check if there are related submissions
        var submissionBatchRepo = _unitOfWork.Repository<SubmissionBatch>();
        var relatedBatches = await submissionBatchRepo.FindAsync(
            sb => sb.ExamId == @event.ExamId,
            context.CancellationToken);

        if (relatedBatches.Any())
        {
            _logger.LogWarning(
                "Exam {ExamId} has {Count} related submission batches. Soft delete or handle appropriately.",
                @event.ExamId,
                relatedBatches.Count());
        }

        examRepo.Delete(exam);
        await _unitOfWork.SaveChangesAsync(context.CancellationToken);

        _logger.LogInformation("Exam {ExamId} deleted from GradingService", @event.ExamId);
    }
}