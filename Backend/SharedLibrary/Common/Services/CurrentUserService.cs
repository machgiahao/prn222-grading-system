using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace SharedLibrary.Common.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private static readonly AsyncLocal<string?> _asyncLocalUserId = new();

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId =>
        _asyncLocalUserId.Value ??
        _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

    public string GetUserIdOrDefault() => UserId ?? "system";

    public void SetUserId(string userId) => _asyncLocalUserId.Value = userId;

    public void ClearUserId() => _asyncLocalUserId.Value = null;
}
