using AutoMapper;
using IdentityService.Application.Dtos;
using IdentityService.Domain.Entities;
using IdentityService.Domain.Repositories;
using Microsoft.AspNetCore.Identity;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Events;
using SharedLibrary.Common.Exceptions;
using SharedLibrary.Common.Repositories;
using SharedLibrary.Contracts;

namespace IdentityService.Application.Users.Commands;

public record CreateUserCommand(CreateUserDto Dto) : ICommand<UserDto>;

public class CreateUserCommandHandler : ICommandHandler<CreateUserCommand, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IEventPublisher _eventPublisher;
    private readonly IMapper _mapper;

    public CreateUserCommandHandler(
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IUnitOfWork unitOfWork,
        IPasswordHasher<User> passwordHasher,
        IEventPublisher eventPublisher,
        IMapper mapper)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _eventPublisher = eventPublisher;
        _mapper = mapper;
    }

    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        // Validate email uniqueness
        if (await _userRepository.EmailExistsAsync(request.Dto.Email, null, cancellationToken))
        {
            throw new ConflictException($"User with email '{request.Dto.Email}' already exists.");
        }

        // Validate roles exist
        if (request.Dto.RoleNames == null || !request.Dto.RoleNames.Any())
        {
            throw new BadRequestException("At least one role must be assigned.");
        }

        // Create new user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Dto.Name,
            Email = request.Dto.Email,
            CreatedAt = DateTime.UtcNow
        };

        // Hash password
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Dto.Password);

        // Assign roles
        user.UserRoles = new List<UserRole>();
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

        _userRepository.Add(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Publish UserCreatedEvent
        await _eventPublisher.PublishAsync(
            new UserCreatedEvent(user.Id, user.Name, user.Email),
            cancellationToken);

        // Reload user with roles for mapping
        var createdUser = await _userRepository.GetByIdAsync(user.Id, cancellationToken);
        return _mapper.Map<UserDto>(createdUser);
    }
}
