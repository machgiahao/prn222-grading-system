using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Yarp.ReverseProxy.Transforms;

namespace ApiGateway;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // CORS
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowLocalhost", policy =>
            {
                policy.WithOrigins(
                        "http://localhost:3000",      // Next.js default
                        "http://localhost:3001",      // Next.js alternative
                        "http://localhost:5173"      // Vite
                    )
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials(); 
            });
        });

        // ===== JWT Authentication =====
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
                    ValidAudience = builder.Configuration["JwtSettings:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Key"]!))
                };

                // Cho phép token từ query string (WebSocket support)
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        if (!string.IsNullOrEmpty(accessToken))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

        builder.Services.AddAuthorization(options =>
        {
            options.AddPolicy("authenticated", policy =>
                policy.RequireAuthenticatedUser());
        });

        // Response Compression
        builder.Services.AddResponseCompression(options =>
        {
            options.EnableForHttps = true;
        });

        //  Rate Limiting
        builder.Services.AddRateLimiter(options =>
        {
            // Auth endpoints
            options.AddFixedWindowLimiter("auth", opt =>
            {
                opt.PermitLimit = 10;
                opt.Window = TimeSpan.FromMinutes(1);
                opt.QueueLimit = 0;
            });

            // Protected endpoints
            options.AddFixedWindowLimiter("api", opt =>
            {
                opt.PermitLimit = 100;
                opt.Window = TimeSpan.FromMinutes(1);
            });

            // File uploads
            options.AddFixedWindowLimiter("upload", opt =>
            {
                opt.PermitLimit = 5;
                opt.Window = TimeSpan.FromMinutes(1);
            });
        });

        // Health Checks 
        builder.Services.AddHealthChecks()
            .AddUrlGroup(new Uri("https://localhost:7000/health"), "IdentityService")
            .AddUrlGroup(new Uri("https://localhost:7001/health"), "ExamService")
            .AddUrlGroup(new Uri("https://localhost:7002/health"), "GradingService");

        // SWAGGER
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "API Gateway - Grading System",
                Version = "v1",
                Description = "Unified API Gateway for Exam Grading System with JWT Authentication",
                Contact = new OpenApiContact
                {
                    Name = "Your Team",
                    Email = "your@email.com"
                }
            });

            // JWT Bearer Authentication
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = @"JWT Authorization header using the Bearer scheme. Enter your token in the text input below. Example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'"
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
                    Array.Empty<string>()
                }
            });
            c.TagActionsBy(api =>
            {
                var path = api.RelativePath ?? "";

                if (path.Contains("/auth/")) return new[] { "Authentication" };
                if (path.Contains("/subject")) return new[] { "Subjects" };
                if (path.Contains("/semester")) return new[] { "Semesters" };
                if (path.Contains("/rubric")) return new[] { "Rubrics" };
                if (path.Contains("/submission")) return new[] { "Submissions" };
                if (path.Contains("/grade")) return new[] { "Grades" };
                if (path.Contains("/report")) return new[] { "Reports" };
                if (path.Contains("/health")) return new[] { "Health" };

                return new[] { "Other" };
            });
        });

        // ===== YARP Reverse Proxy =====
        builder.Services.AddReverseProxy()
            .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
            .AddTransforms(builderContext =>
            {
                // Forward Authorization header
                builderContext.AddRequestTransform(transformContext =>
                {
                    var authHeader = transformContext.HttpContext.Request.Headers.Authorization;
                    if (!string.IsNullOrEmpty(authHeader))
                    {
                        transformContext.ProxyRequest.Headers.TryAddWithoutValidation(
                            "Authorization", authHeader.ToString());
                    }
                    return ValueTask.CompletedTask;
                });

                // Add X-Forwarded headers
                builderContext.AddRequestTransform(transformContext =>
                {
                    var request = transformContext.HttpContext.Request;
                    transformContext.ProxyRequest.Headers.TryAddWithoutValidation(
                        "X-Forwarded-Host", request.Host.ToString());
                    transformContext.ProxyRequest.Headers.TryAddWithoutValidation(
                        "X-Forwarded-Proto", request.Scheme);
                    transformContext.ProxyRequest.Headers.TryAddWithoutValidation(
                        "X-Real-IP", transformContext.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "");
                    return ValueTask.CompletedTask;
                });
            });

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();

            // SWAGGER UI
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "API Gateway v1");
                c.RoutePrefix = "swagger";  // URL: https://localhost:5001/swagger
                c.DocumentTitle = "API Gateway - Grading System";

                // Enable deep linking
                c.EnableDeepLinking();

                // Enable filter
                c.EnableFilter();

                // Enable try it out by default
                c.EnableTryItOutByDefault();
            });
        }
        else
        {
            app.UseExceptionHandler("/error");
            app.UseHsts();
        }

        // 2. Request/Response Logging
        app.Use(async (context, next) =>
        {
            var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
            var startTime = DateTime.UtcNow;

            logger.LogInformation(
                "[Gateway IN]  {Method} {Path} from {IP}",
                context.Request.Method,
                context.Request.Path,
                context.Connection.RemoteIpAddress
            );

            await next();

            var duration = DateTime.UtcNow - startTime;
            var statusIcon = context.Response.StatusCode switch
            {
                >= 200 and < 300 => "✅",
                >= 400 and < 500 => "⚠️",
                >= 500 => "❌",
                _ => "ℹ️"
            };

            logger.LogInformation(
                "{Icon} [Gateway OUT] {Method} {Path} → {StatusCode} ({Duration}ms)",
                statusIcon,
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                duration.TotalMilliseconds
            );
        });

        // 3. Response Compression
        app.UseResponseCompression();

        // 4. HTTPS Redirection
        app.UseHttpsRedirection();

        // 5. CORS
        app.UseCors("AllowLocalhost");

        app.UseRateLimiter();

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapHealthChecks("/health");

        app.MapReverseProxy();

        app.Run();
    }
}
