using ScanService.Application;
using ScanService.Infrastructure;
using SharedLibrary.Common.Services;

namespace ScanService.Worker;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = Host.CreateApplicationBuilder(args);

        builder.Services
            .AddApplicationService(builder.Configuration)
            .AddInfrastructureService(builder.Configuration);
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
        var host = builder.Build();
        host.Run();
    }
}