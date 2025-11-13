using GradingService.Application.Services;
using GradingService.Infrastructure.Context;
using GradingService.Infrastructure.Interceptors;
using GradingService.Infrastructure.Repositories;
using GradingService.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Minio;
using SharedLibrary.Common.Repositories;
using SharedLibrary.Configs;

using OurMinioConfig = SharedLibrary.Configs.MinioConfig;

namespace GradingService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration configuration)
    {
        services.ConfigureOptions<DatabaseConfigSetup>();

        services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddDbContext<GradingDbContext>((sp, options) =>
        {
            var dbConfig = sp.GetRequiredService<IOptions<DatabaseConfig>>().Value;
            options.UseNpgsql(dbConfig.ConnectionString, a =>
            {
                if (dbConfig.MaxRetryCount > 0)
                {
                    a.EnableRetryOnFailure(dbConfig.MaxRetryCount);
                }
                if (dbConfig.CommandTimeout > 0)
                {
                    a.CommandTimeout(dbConfig.CommandTimeout);
                }
            });
            options.AddInterceptors(sp.GetServices<ISaveChangesInterceptor>());
        });

        // Setup minIO
        services.ConfigureOptions<MinioConfigSetup>();
        // Register IMinioClient
        services.AddSingleton<IMinioClient>(sp =>
        {
            var minioConfig = sp.GetRequiredService<IOptions<OurMinioConfig>>().Value;

            var endpoint = minioConfig.Endpoint
                            .Replace("http://", "")
                            .Replace("https://", "");

            var client = new MinioClient()
                .WithEndpoint(endpoint)
                .WithCredentials(minioConfig.AccessKey, minioConfig.SecretKey);

            if (minioConfig.Endpoint.StartsWith("https"))
                client = client.WithSSL();

            return client.Build();
        });

        services.AddScoped<IFileStorageService, MinioStorageService>();
        return services;
    }
}
