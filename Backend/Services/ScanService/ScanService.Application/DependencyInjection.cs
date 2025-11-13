using FluentValidation;
using MassTransit.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ScanService.Application.Consumers;
using SharedLibrary.Behaviors;
using SharedLibrary.Common.Events;
using SharedLibrary.MassTransit;

namespace ScanService.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationService(this IServiceCollection services, IConfiguration configuration)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
            cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
        });
        // Register consumers
        services.RegisterConsumer<SubmissionBatchUploadedConsumer>();

        services.AddValidatorsFromAssembly(assembly);
        services.AddMessageBroker(configuration, assembly);
        services.AddScoped<IEventPublisher, MassTransitEventPublisher>();
        return services;
    }
}
