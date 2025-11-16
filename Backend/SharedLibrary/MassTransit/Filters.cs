using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using SharedLibrary.Common.Services;

namespace SharedLibrary.MassTransit;

public class UserContextFilter<T> : IFilter<ConsumeContext<T>> where T : class
{
    private readonly IServiceProvider _serviceProvider;

    public UserContextFilter(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task Send(ConsumeContext<T> context, IPipe<ConsumeContext<T>> next)
    {
        using var scope = _serviceProvider.CreateScope();
        var currentUserService = scope.ServiceProvider.GetRequiredService<ICurrentUserService>();

        var userId = ExtractUserIdFromMessage(context.Message);

        if (!string.IsNullOrEmpty(userId))
        {
            currentUserService.SetUserId(userId);
        }

        try
        {
            await next.Send(context);
        }
        finally
        {
            currentUserService.ClearUserId();
        }
    }

    private string? ExtractUserIdFromMessage(T message)
    {
        var type = message.GetType();

        var propertyNames = new[] { "UploadedByManagerId", "UserId", "CreatedBy", "ModifiedBy" };

        foreach (var propName in propertyNames)
        {
            var prop = type.GetProperty(propName);
            if (prop != null)
            {
                var value = prop.GetValue(message);
                if (value is Guid guid && guid != Guid.Empty)
                {
                    return guid.ToString();
                }
                if (value is string str && !string.IsNullOrEmpty(str))
                {
                    return str;
                }
            }
        }

        return null;
    }

    public void Probe(ProbeContext context)
    {
        context.CreateFilterScope("userContext");
    }
}