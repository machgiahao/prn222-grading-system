using GradingService.Domain.Entities;
using MassTransit;
using Microsoft.Extensions.Logging;
using SharedLibrary.Common.Repositories;
using SharedLibrary.Contracts;

namespace GradingService.Application.Consumers;

public class ExamUpdatedEventConsumer : IConsumer<ExamUpdatedEvent>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ExamUpdatedEventConsumer> _logger;

    public ExamUpdatedEventConsumer(
        IUnitOfWork unitOfWork,
        ILogger<ExamUpdatedEventConsumer> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ExamUpdatedEvent> context)
    {
        var @event = context.Message;
        _logger.LogInformation("Consuming ExamUpdatedEvent for ExamId: {ExamId}", @event.ExamId);

        var examRepo = _unitOfWork.Repository<Exam>();
        var existingExams = await examRepo.FindAsync(
            e => e.Id == @event.ExamId,
            context.CancellationToken);

        var exam = existingExams.FirstOrDefault();

        if (exam == null)
        {
            _logger.LogWarning("Exam {ExamId} not found in GradingService. Creating new exam.", @event.ExamId);

            exam = new Exam
            {
                Id = @event.ExamId,
                ExamCode = @event.ExamCode,
                ForbiddenKeywords = @event.ForbiddenKeywords,
                CreatedAt = DateTime.UtcNow
            };

            await examRepo.AddAsync(exam, context.CancellationToken);
        }
        else
        {
            // Update existing exam
            exam.ExamCode = @event.ExamCode;
            exam.ForbiddenKeywords = @event.ForbiddenKeywords;
            exam.UpdatedAt = DateTime.UtcNow;

            examRepo.Update(exam);
        }

        await _unitOfWork.SaveChangesAsync(context.CancellationToken);

        _logger.LogInformation("Exam {ExamId} ({ExamCode}) updated in GradingService", @event.ExamId, @event.ExamCode);
    }
}
