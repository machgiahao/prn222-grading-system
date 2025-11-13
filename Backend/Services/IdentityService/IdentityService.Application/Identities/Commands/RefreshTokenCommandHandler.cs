using IdentityService.Application.Dtos;
using IdentityService.Application.Services;
using IdentityService.Domain.Entities;
using IdentityService.Domain.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Exceptions;
using SharedLibrary.Common.Repositories;

namespace IdentityService.Application.Identities.Commands;

public sealed record RefreshTokenCommand() : ICommand<AuthResponseDto>;

public class RefreshTokenCommandHandler : ICommandHandler<RefreshTokenCommand, AuthResponseDto>
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly ITokenService _tokenService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public RefreshTokenCommandHandler(
        IRefreshTokenRepository refreshTokenRepository,
        IRoleRepository roleRepository,
        ITokenService tokenService,
        IUnitOfWork unitOfWork,
        IConfiguration configuration,
        IHttpContextAccessor httpContextAccessor)
    {
        _refreshTokenRepository = refreshTokenRepository;
        _roleRepository = roleRepository;
        _tokenService = tokenService;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _httpContextAccessor = httpContextAccessor; 
    }

    public async Task<AuthResponseDto> Handle(RefreshTokenCommand command, CancellationToken cancellationToken)
    {
        var oldTokenString = GetRefreshTokenFromCookie();

        if (string.IsNullOrEmpty(oldTokenString))
        {
            throw new UnauthorizedException("Missing refresh token cookie.");
        }

        var oldToken = await _refreshTokenRepository.GetByTokenAsync(oldTokenString, cancellationToken);
        if (oldToken == null)
            throw new UnauthorizedException("Invalid refresh token.");
        if (oldToken.IsRevoked)
            throw new UnauthorizedException("Refresh token has been revoked.");
        if (oldToken.ExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedException("Refresh token has expired.");

        var user = oldToken.User;
        if (user == null)
            throw new Exception("Critical error: User not found for token.");

        // Revoke token
        oldToken.Revoked = DateTime.UtcNow;

        var roles = await _roleRepository.GetRolesByUserIdAsync(user.Id, cancellationToken);
        var roleNames = roles.Select(r => r.Name).ToList();
        var newAccessToken = _tokenService.GenerateAccessToken(user, roleNames);

        var newRefreshTokenString = _tokenService.GenerateRefreshTokenString();
        var newRefreshTokenExpiry = DateTime.UtcNow.AddDays(
            Convert.ToDouble(_configuration["JwtSettings:RefreshTokenDurationInDays"])
        );
        var newRefreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = newRefreshTokenString,
            ExpiresAt = newRefreshTokenExpiry
        };
        _refreshTokenRepository.Add(newRefreshToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        SetRefreshTokenCookie(newRefreshTokenString, newRefreshTokenExpiry);

        return new AuthResponseDto(
            AccessToken: newAccessToken
        );
    }

    private string? GetRefreshTokenFromCookie()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            throw new InvalidOperationException("HttpContext is not available.");
        }

        return httpContext.Request.Cookies["refreshToken"];
    }

    private void SetRefreshTokenCookie(string refreshToken, DateTime expires)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            throw new InvalidOperationException("HttpContext is not available.");
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
