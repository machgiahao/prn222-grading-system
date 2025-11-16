using IdentityService.Application;
using IdentityService.Infrastructure;
using IdentityService.Infrastructure.Context;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SharedLibrary.Common.Exceptions.Handler;
using SharedLibrary.Common.Extensions;
using SharedLibrary.Common.Services;
using System.Text;

namespace IdentityService.API
{
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
                                "http://localhost:5000",
                                "https://localhost:7000"
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

            builder.Services.AddExceptionHandler<CustomExceptionHandler>();
            builder.Services.AddProblemDetails();
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = configuration["JwtSettings:Issuer"],
                        ValidAudience = configuration["JwtSettings:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(configuration["JwtSettings:Key"]!))
                    };
                });

            builder.Services.AddAuthorization();
            var app = builder.Build();
            app.ApplyMigrations<IdentityDbContext>();
            app.UseCors(policy =>
                policy.WithOrigins("*")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
            );
            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            app.UseCors("AllowSpecificOrigins");
            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseExceptionHandler(options => { });

            app.MapControllers();

            app.Run();
        }
    }
}
