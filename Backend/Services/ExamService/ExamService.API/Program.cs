using ExamService.Application;
using ExamService.Infrastructure;
using Microsoft.AspNetCore.OData;
using SharedLibrary.Common.Exceptions.Handler;
using Microsoft.OData.ModelBuilder;
using Microsoft.OData.Edm;
using ExamService.API.Configurations;

namespace ExamService.API;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services
            .AddApplicationService(builder.Configuration)
            .AddInfrastructureService(builder.Configuration);

        builder.Services.AddExceptionHandler<CustomExceptionHandler>();
        builder.Services.AddProblemDetails();
        builder.Services.AddControllers()
                .AddOData(options =>
                    options
                        .AddRouteComponents("api", ODataConfig.GetEdmModel())
                        .EnableQueryFeatures()
                        .SetMaxTop(100) 
                );
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }
        app.UseHttpsRedirection();

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseExceptionHandler(options => { });

        app.MapControllers();

        app.Run();
    }
}
