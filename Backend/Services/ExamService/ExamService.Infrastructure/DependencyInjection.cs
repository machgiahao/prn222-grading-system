using ExamService.Domain.Repositories;
using ExamService.Infrastructure.Context;
using ExamService.Infrastructure.Interceptors;
using ExamService.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using SharedLibrary.Common.Repositories;
using SharedLibrary.Configs;

namespace ExamService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration configuration)
    {
        services.ConfigureOptions<DatabaseConfigSetup>();

        services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<ISubjectRepository, SubjectRepository>();
        services.AddScoped<ISemesterRepository, SemesterRepository>();
        services.AddDbContext<ExamDbContext>((sp, options) =>
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
        return services;
    }
}
