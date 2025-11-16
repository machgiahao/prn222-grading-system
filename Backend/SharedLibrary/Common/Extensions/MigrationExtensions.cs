using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace SharedLibrary.Common.Extensions;

public static class MigrationExtensions
{
    /// <summary>
    /// Automatically applies pending migrations for the specified DbContext
    /// Only runs in Development and Staging environments for safety
    /// </summary>
    public static IApplicationBuilder ApplyMigrations<TContext>(
        this IApplicationBuilder app)
        where TContext : DbContext
    {
        using var scope = app.ApplicationServices.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<TContext>>();
        var env = services.GetRequiredService<IHostEnvironment>();

        try
        {
            var context = services.GetRequiredService<TContext>();

            // Only auto-migrate in Development and Staging
            if (env.IsDevelopment() || env.IsStaging())
            {
                var pendingMigrations = context.Database.GetPendingMigrations().ToList();

                if (pendingMigrations.Any())
                {
                    logger.LogInformation(
                        "Applying {Count} pending migrations for {DbContext}...",
                        pendingMigrations.Count,
                        typeof(TContext).Name);

                    foreach (var migration in pendingMigrations)
                    {
                        logger.LogInformation("- {Migration}", migration);
                    }

                    context.Database.Migrate();
                    logger.LogInformation("Migrations applied successfully for {DbContext}", typeof(TContext).Name);
                }
                else
                {
                    logger.LogInformation("No pending migrations for {DbContext}", typeof(TContext).Name);
                }
            }
            else
            {
                logger.LogWarning(
                    "Auto-migration is disabled in {Environment} environment. Please run migrations manually.",
                    env.EnvironmentName);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while migrating the database for {DbContext}", typeof(TContext).Name);

            // Re-throw in development to catch issues early
            if (env.IsDevelopment())
            {
                throw;
            }
        }

        return app;
    }

    /// <summary>
    /// Forces migration regardless of environment (use with caution!)
    /// </summary>
    public static IApplicationBuilder ApplyMigrationsForce<TContext>(
        this IApplicationBuilder app)
        where TContext : DbContext
    {
        using var scope = app.ApplicationServices.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<TContext>>();

        try
        {
            var context = services.GetRequiredService<TContext>();

            logger.LogWarning("Force applying migrations for {DbContext}...", typeof(TContext).Name);
            context.Database.Migrate();
            logger.LogInformation("Migrations applied successfully for {DbContext}", typeof(TContext).Name);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while migrating the database for {DbContext}", typeof(TContext).Name);
            throw;
        }

        return app;
    }
}