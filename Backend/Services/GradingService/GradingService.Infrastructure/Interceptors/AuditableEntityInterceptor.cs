using GradingService.Domain.Abstractions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Claims;

namespace GradingService.Infrastructure.Interceptors;

public class AuditableEntityInterceptor : SaveChangesInterceptor
{
    private readonly IServiceProvider _serviceProvider;

    public AuditableEntityInterceptor(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        UpdateEntities(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        UpdateEntities(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void UpdateEntities(DbContext? context)
    {
        if (context == null) return;

        string userId = GetCurrentUserId();
        DateTime utcNow = DateTime.UtcNow;

        foreach (var entry in context.ChangeTracker.Entries<IEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Property(e => e.CreatedBy).CurrentValue = userId;
                entry.Property(e => e.CreatedAt).CurrentValue = utcNow;
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Property(e => e.UpdatedBy).CurrentValue = userId;
                entry.Property(e => e.UpdatedAt).CurrentValue = utcNow;
            }
        }
    }

    private string GetCurrentUserId()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var httpContextAccessor = scope.ServiceProvider
                .GetService<IHttpContextAccessor>();

            var userId = httpContextAccessor?
                .HttpContext?
                .User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            return userId ?? "system";
        }
    }
}