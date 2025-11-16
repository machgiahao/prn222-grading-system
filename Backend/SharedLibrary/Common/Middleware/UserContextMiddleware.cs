using Microsoft.AspNetCore.Http;
using SharedLibrary.Common.Services;
using System.Security.Claims;

namespace SharedLibrary.Common.Middleware;

public class UserContextMiddleware
{
    private readonly RequestDelegate _next;

    public UserContextMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ICurrentUserService currentUserService)
    {
        // Extract userId from JWT claims
        var userId = context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!string.IsNullOrEmpty(userId))
        {
            currentUserService.SetUserId(userId);
        }

        try
        {
            await _next(context);
        }
        finally
        {
            currentUserService.ClearUserId();
        }
    }
}
