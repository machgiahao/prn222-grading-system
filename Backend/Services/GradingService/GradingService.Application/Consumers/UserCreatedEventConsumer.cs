using GradingService.Domain.Entities;
using GradingService.Domain.Repositories;
using MassTransit;
using Microsoft.Extensions.Logging;
using SharedLibrary.Common.Repositories;
using SharedLibrary.Contracts;

namespace GradingService.Application.Consumers;

public class UserCreatedEventConsumer : IConsumer<UserCreatedEvent>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UserCreatedEventConsumer> _logger;

    public UserCreatedEventConsumer(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        ILogger<UserCreatedEventConsumer> logger)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<UserCreatedEvent> context)
    {
        var @event = context.Message;
        _logger.LogInformation("Consuming UserCreatedEvent for UserId: {UserId}", @event.Id);

        // Check if user already exists
        var existingUser = await _userRepository.FindByIdAsync(@event.Id, context.CancellationToken);
        if (existingUser != null)
        {
            _logger.LogWarning("User {UserId} already exists in GradingService", @event.Id);
            return;
        }

        var user = new User
        {
            Id = @event.Id,
            Name = @event.Name,
            Email = @event.Email,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user, context.CancellationToken);
        await _unitOfWork.SaveChangesAsync(context.CancellationToken);

        _logger.LogInformation("User {UserId} synced to GradingService", @event.Id);
    }
}
