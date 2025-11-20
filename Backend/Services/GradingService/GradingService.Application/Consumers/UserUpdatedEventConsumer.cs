using GradingService.Domain.Repositories;
using MassTransit;
using Microsoft.Extensions.Logging;
using SharedLibrary.Common.Repositories;
using SharedLibrary.Contracts;

namespace GradingService.Application.Consumers;

public class UserUpdatedEventConsumer : IConsumer<UserUpdatedEvent>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UserUpdatedEventConsumer> _logger;

    public UserUpdatedEventConsumer(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        ILogger<UserUpdatedEventConsumer> logger)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<UserUpdatedEvent> context)
    {
        var @event = context.Message;
        _logger.LogInformation("Consuming UserUpdatedEvent for UserId: {UserId}", @event.Id);

        var user = await _userRepository.FindByIdAsync(@event.Id, context.CancellationToken);
        if (user == null)
        {
            _logger.LogWarning("User {UserId} not found in GradingService", @event.Id);
            return;
        }

        user.Name = @event.Name;
        user.Email = @event.Email;
        user.UpdatedAt = DateTime.UtcNow;

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(context.CancellationToken);

        _logger.LogInformation("User {UserId} updated in GradingService", @event.Id);
    }
}
