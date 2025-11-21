using FluentValidation;
using GradingService.Application.Consumers;
using MassTransit.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SharedLibrary.Behaviors;
using SharedLibrary.Common.Events;
using SharedLibrary.MassTransit;
using System.Reflection;

namespace GradingService.Application;

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
        services.AddAutoMapper(Assembly.GetExecutingAssembly());
        services.AddValidatorsFromAssembly(assembly);
        services.AddAutoMapper(assembly);
        services.AddMessageBroker(configuration, assembly);
        services.AddScoped<IEventPublisher, MassTransitEventPublisher>();
        services.RegisterConsumer<ScanCompletedEventConsumer>();
        services.RegisterConsumer<UserCreatedEventConsumer>();
        services.RegisterConsumer<UserUpdatedEventConsumer>();
        services.RegisterConsumer<UserDeletedEventConsumer>();
        services.RegisterConsumer<ExamCreatedEventConsumer>();
        services.RegisterConsumer<ExamUpdatedEventConsumer>();
        services.RegisterConsumer<ExamDeletedEventConsumer>();
        return services;
    }
}
