using IdentityService.Application.Dtos;
using IdentityService.Domain.Repositories;
using MediatR;
using Microsoft.AspNetCore.Http;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace IdentityService.Application.Identities.Commands;

public sealed record LogoutCommand() : ICommand;

public class LogoutCommandHandler : ICommandHandler<LogoutCommand>
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUnitOfWork _unitOfWork;

    // --- 2. TIÊM "VẾT BẨN" (IHttpContextAccessor) ---
    private readonly IHttpContextAccessor _httpContextAccessor;

    public LogoutCommandHandler(
        IRefreshTokenRepository refreshTokenRepository,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _refreshTokenRepository = refreshTokenRepository;
        _unitOfWork = unitOfWork;
        _httpContextAccessor = httpContextAccessor; 
    }

    public async Task<Unit> Handle(LogoutCommand command, CancellationToken cancellationToken)
    {
        var tokenString = GetRefreshTokenFromCookie();

        if (!string.IsNullOrEmpty(tokenString))
        {
            var token = await _refreshTokenRepository.GetByTokenAsync(tokenString, cancellationToken);
            if (token != null && !token.IsRevoked)
            {
                token.Revoked = DateTime.UtcNow;
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
        }

        DeleteRefreshTokenCookie();

        return Unit.Value;
    }

    private string? GetRefreshTokenFromCookie()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        return httpContext?.Request.Cookies["refreshToken"];
    }

    private void DeleteRefreshTokenCookie()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            return;
        }

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(-1)
        };

        httpContext.Response.Cookies.Append("refreshToken", "", cookieOptions);
    }
}
