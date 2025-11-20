using GradingService.Domain.Repositories;
using MassTransit;
using Microsoft.Extensions.Logging;
using SharedLibrary.Common.Repositories;
using SharedLibrary.Contracts;

namespace GradingService.Application.Consumers;

public class UserDeletedEventConsumer : IConsumer<UserDeletedEvent>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UserDeletedEventConsumer> _logger;

    public UserDeletedEventConsumer(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        ILogger<UserDeletedEventConsumer> logger)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<UserDeletedEvent> context)
    {
        var @event = context.Message;
        _logger.LogInformation("Consuming UserDeletedEvent for UserId: {UserId}", @event.Id);

        var user = await _userRepository.FindByIdAsync(@event.Id, context.CancellationToken);
        if (user == null)
        {
            _logger.LogWarning("User {UserId} not found in GradingService", @event.Id);
            return;
        }

        _userRepository.Delete(user);
        await _unitOfWork.SaveChangesAsync(context.CancellationToken);

        _logger.LogInformation("User {UserId} deleted from GradingService", @event.Id);
    }
}
