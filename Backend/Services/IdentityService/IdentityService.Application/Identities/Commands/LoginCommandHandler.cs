using IdentityService.Application.Dtos;
using IdentityService.Application.Services;
using IdentityService.Domain.Entities;
using IdentityService.Domain.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Exceptions;
using SharedLibrary.Common.Repositories;

namespace IdentityService.Application.Identities.Commands;

public sealed record LoginCommand(LoginRequestDto Dto) : ICommand<AuthResponseDto>;

public class LoginCommandHandler : ICommandHandler<LoginCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        ITokenService tokenService,
        IPasswordHasher<User> passwordHasher,
        IRefreshTokenRepository refreshTokenRepository,
        IUnitOfWork unitOfWork,
        IConfiguration configuration,
        IHttpContextAccessor httpContextAccessor)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _refreshTokenRepository = refreshTokenRepository;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<AuthResponseDto> Handle(LoginCommand command, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(command.Dto.Email, cancellationToken);
        if (user == null)
        {
            throw new UnauthorizedException("Email or password is invalid !");
        }

        var passwordResult = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            command.Dto.Password
        );

        if (passwordResult == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedException("Email or password is invalid !");
        }

        var roles = await _roleRepository.GetRolesByUserIdAsync(user.Id, cancellationToken);
        var roleNames = roles.Select(r => r.Name).ToList();

        // Generate access token
        var accessToken = _tokenService.GenerateAccessToken(user, roleNames);

        // Generate refresh token
        var refreshTokenString = _tokenService.GenerateRefreshTokenString();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(
            Convert.ToDouble(_configuration["JwtSettings:RefreshTokenDurationInDays"])
        );
        var refreshToken = new RefreshToken
        {
            Token = refreshTokenString,
            ExpiresAt = refreshTokenExpiry,
            UserId = user.Id
        };

        _refreshTokenRepository.Add(refreshToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
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
