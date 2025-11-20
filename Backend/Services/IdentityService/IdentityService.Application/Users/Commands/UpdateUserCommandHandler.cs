using AutoMapper;
using IdentityService.Application.Dtos;
using IdentityService.Domain.Entities;
using IdentityService.Domain.Repositories;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Events;
using SharedLibrary.Common.Exceptions;
using SharedLibrary.Common.Repositories;
using SharedLibrary.Contracts;

namespace IdentityService.Application.Users.Commands;

public record UpdateUserCommand(Guid UserId, UpdateUserDto Dto) : ICommand<UserDto>;

public class UpdateUserCommandHandler : ICommandHandler<UpdateUserCommand, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IEventPublisher _eventPublisher;

    public UpdateUserCommandHandler(
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IEventPublisher eventPublisher)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _eventPublisher = eventPublisher;
    }

    public async Task<UserDto> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        // Get existing user
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException($"User with ID '{request.UserId}' not found.");
        }

        // Validate email uniqueness (excluding current user)
        if (await _userRepository.EmailExistsAsync(request.Dto.Email, request.UserId, cancellationToken))
        {
            throw new ConflictException($"Email '{request.Dto.Email}' is already in use by another user.");
        }

        // Update basic info
        user.Name = request.Dto.Name;
        user.Email = request.Dto.Email;
        user.UpdatedAt = DateTime.UtcNow;

        // Update roles if provided
        if (request.Dto.RoleNames != null && request.Dto.RoleNames.Any())
        {
            // Remove existing roles
            user.UserRoles.Clear();

            // Add new roles
            foreach (var roleName in request.Dto.RoleNames)
            {
                var role = await _roleRepository.GetByNameAsync(roleName, cancellationToken);
                if (role == null)
                {
                    throw new NotFoundException($"Role '{roleName}' not found.");
                }

                user.UserRoles.Add(new UserRole
                {
                    UserId = user.Id,
                    RoleId = role.Id
                });
            }
        }

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Publish UserUpdatedEvent
        await _eventPublisher.PublishAsync(
            new UserUpdatedEvent(user.Id, user.Name, user.Email),
            cancellationToken);

        // Reload user with roles
        var updatedUser = await _userRepository.GetByIdAsync(user.Id, cancellationToken);
        return _mapper.Map<UserDto>(updatedUser);
    }
}
