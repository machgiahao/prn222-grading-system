using IdentityService.Domain.Repositories;
using MediatR;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Events;
using SharedLibrary.Common.Exceptions;
using SharedLibrary.Common.Repositories;
using SharedLibrary.Contracts;

namespace IdentityService.Application.Users.Commands;

public record DeleteUserCommand(Guid UserId) : ICommand<Unit>;

public class DeleteUserCommandHandler : ICommandHandler<DeleteUserCommand, Unit>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEventPublisher _eventPublisher;

    public DeleteUserCommandHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IEventPublisher eventPublisher)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _eventPublisher = eventPublisher;
    }

    public async Task<Unit> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException($"User with ID '{request.UserId}' not found.");
        }

        _userRepository.Delete(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // publish UserDeletedEvent
        await _eventPublisher.PublishAsync(
            new UserDeletedEvent(request.UserId),
            cancellationToken);

        return Unit.Value;
    }
}
