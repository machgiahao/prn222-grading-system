using FluentValidation;
using IdentityService.Application.Dtos;
using IdentityService.Application.Services;
using IdentityService.Domain.Entities;
using IdentityService.Domain.Repositories;
using MassTransit;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using SharedLibrary.Common.Constants;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Exceptions;
using SharedLibrary.Common.Repositories;
using SharedLibrary.Contracts;

namespace IdentityService.Application.Identities.Commands;

public sealed record RegisterCommand(
    string Name,
    string Email,
    string Password
) : ICommand<AuthResponseDto>;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();

        RuleFor(x => x.Password).NotEmpty().MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase character.")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase character.")
            .Matches("[0-9]").WithMessage("Password must contain at least one number.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character.");
    }
}

public class RegisterCommandHandler : ICommandHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository; 
    private readonly ITokenService _tokenService; 
    private readonly IRefreshTokenRepository _refreshTokenRepository; 
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IPublishEndpoint _eventBus;
    private readonly IConfiguration _configuration; 
    private readonly IHttpContextAccessor _httpContextAccessor; 

    public RegisterCommandHandler(
        IUserRepository userRepository,
        IRoleRepository roleRepository, 
        ITokenService tokenService, 
        IRefreshTokenRepository refreshTokenRepository, 
        IUnitOfWork unitOfWork,
        IPasswordHasher<User> passwordHasher,
        IPublishEndpoint eventBus,
        IConfiguration configuration, 
        IHttpContextAccessor httpContextAccessor) 
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _tokenService = tokenService;
        _refreshTokenRepository = refreshTokenRepository;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _eventBus = eventBus;
        _configuration = configuration;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<AuthResponseDto> Handle(RegisterCommand command, CancellationToken cancellationToken)
    {
        if (await _userRepository.ExistsByEmailAsync(command.Email, cancellationToken))
        {
            throw new ConflictException("Email already exists.");
        }

        var user = new User
        {
            Name = command.Name,
            Email = command.Email,
            PasswordHash = _passwordHasher.HashPassword(null!, command.Password)
        };

        var defaultRole = await _roleRepository.GetByNameAsync(SystemRoles.Examiner, cancellationToken)
            ?? throw new NotFoundException($"Default role '{SystemRoles.Examiner}' not found in system.");
        user.UserRoles.Add(new UserRole
        {
            User = user,
            Role = defaultRole,
            AssignedAt = DateTime.UtcNow
        });

        _userRepository.Add(user);
        var roleNames = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var accessToken = _tokenService.GenerateAccessToken(user, roleNames);

        var refreshTokenString = _tokenService.GenerateRefreshTokenString();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(
            Convert.ToDouble(_configuration["JwtSettings:RefreshTokenDurationInDays"])
        );
        var refreshToken = new RefreshToken
        {
            User = user,
            Token = refreshTokenString,
            ExpiresAt = refreshTokenExpiry,
        };
        _refreshTokenRepository.Add(refreshToken); 
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var userCreatedEvent = new UserCreatedEvent(user.Id, user.Name, user.Email);
        await _eventBus.Publish(userCreatedEvent, cancellationToken);

        SetRefreshTokenCookie(refreshTokenString, refreshTokenExpiry);

        return new AuthResponseDto(
            AccessToken: accessToken
        );
    }

    private void SetRefreshTokenCookie(string refreshToken, DateTime expires)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            throw new InvalidOperationException("HttpContext is not available to set cookie.");
        }

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            Expires = expires,
            SameSite = SameSiteMode.None
        };

        httpContext.Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }
}
