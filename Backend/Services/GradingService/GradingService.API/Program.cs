
using GradingService.Application;
using GradingService.Infrastructure;
using GradingService.Infrastructure.Context;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SharedLibrary.Common.Exceptions.Handler;
using SharedLibrary.Common.Extensions;
using SharedLibrary.Common.Services;
using System.Text;

namespace GradingService.API;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var configuration = builder.Configuration;

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowSpecificOrigins",
                policy =>
                {
                    policy.WithOrigins(
                            "http://localhost:5002",
                            "https://localhost:7002"
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
        });

        builder.Services
            .AddApplicationService(configuration)
            .AddInfrastructureService(configuration);
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(o =>
        {
            o.TokenValidationParameters = new TokenValidationParameters
            {
                ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
                ValidAudience = builder.Configuration["JwtSettings:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey
                (Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Key"])),

                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true
            };
        });
        builder.Services.AddControllers();
        builder.Services.AddExceptionHandler<CustomExceptionHandler>();
        builder.Services.AddProblemDetails();

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "GradingService API", Version = "v1" });
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "JWT Authorization header. Enter 'Bearer' [space] and paste your token here.\n\nFor example: \"Bearer eyJhbGciOiJ...\""
            });
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    new string[] {}
                }
            });
        });
        builder.Services.AddAuthorization();

        var app = builder.Build();
        app.ApplyMigrations<GradingDbContext>();
        app.UseCors(policy =>
            policy.WithOrigins("*")
                .AllowAnyHeader()
                .AllowAnyMethod()
        );
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }
        app.UseHttpsRedirection();

        app.UseAuthentication();
        app.UseAuthorization();
        app.UseUserContext();
        app.UseExceptionHandler(options => { });

        app.MapControllers();

        app.Run();
    }
}
