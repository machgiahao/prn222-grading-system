using GradingService.Domain.Entities;
using MassTransit;
using Microsoft.Extensions.Logging;
using SharedLibrary.Common.Repositories;
using SharedLibrary.Contracts;

namespace GradingService.Application.Consumers;

public class ExamCreatedEventConsumer : IConsumer<ExamCreatedEvent>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ExamCreatedEventConsumer> _logger;

    public ExamCreatedEventConsumer(
        IUnitOfWork unitOfWork,
        ILogger<ExamCreatedEventConsumer> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ExamCreatedEvent> context)
    {
        var @event = context.Message;
        _logger.LogInformation("Consuming ExamCreatedEvent for ExamId: {ExamId}", @event.ExamId);

        // Check if exam already exists
        var examRepo = _unitOfWork.Repository<Exam>();
        var existingExams = await examRepo.FindAsync(
            e => e.Id == @event.ExamId,
            context.CancellationToken);

        if (existingExams.Any())
        {
            _logger.LogWarning("Exam {ExamId} already exists in GradingService", @event.ExamId);
            return;
        }

        var exam = new Exam
        {
            Id = @event.ExamId,
            ExamCode = @event.ExamCode,
            ForbiddenKeywords = @event.ForbiddenKeywords,
            CreatedAt = DateTime.UtcNow
        };

        await examRepo.AddAsync(exam, context.CancellationToken);
        await _unitOfWork.SaveChangesAsync(context.CancellationToken);

        _logger.LogInformation("Exam {ExamId} ({ExamCode}) synced to GradingService", @event.ExamId, @event.ExamCode);
    }
}
