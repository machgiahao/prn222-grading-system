using Microsoft.AspNetCore.Builder;
using SharedLibrary.Common.Middleware;

namespace SharedLibrary.Common.Extensions;

public static class ApplicationBuilderExtensions
{
    public static IApplicationBuilder UseUserContext(this IApplicationBuilder app)
    {
        return app.UseMiddleware<UserContextMiddleware>();
    }
}