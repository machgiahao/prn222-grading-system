using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
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
        builder.WebHost.ConfigureKestrel(options =>
        {
            options.Limits.MaxRequestBodySize = 524288000; // 500MB
            options.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(10);
        });

        // config FormOptions
        builder.Services.Configure<FormOptions>(options =>
        {
            options.MultipartBodyLengthLimit = 524288000; // 500MB
            options.ValueLengthLimit = 524288000;
            options.MultipartHeadersLengthLimit = 524288000;
        });
        // CORS
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowLocalhost", policy =>
            {
                policy.WithOrigins(
                        "http://localhost:3000",
                        "http://localhost:3001",
                        "http://localhost:5173"
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
                    },
                    OnTokenValidated = context =>
                    {
                        Console.WriteLine("✅ Token validated successfully");
                        var claims = context.Principal?.Claims.Select(c => $"{c.Type}: {c.Value}");
                        Console.WriteLine($"Claims: {string.Join(", ", claims ?? Array.Empty<string>())}");
                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = context =>
                    {
                        Console.WriteLine($"❌ Token authentication failed: {context.Exception.Message}");
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

        // Rate Limiting
        builder.Services.AddRateLimiter(options =>
        {
            options.AddFixedWindowLimiter("auth", opt =>
            {
                opt.PermitLimit = 10;
                opt.Window = TimeSpan.FromMinutes(1);
                opt.QueueLimit = 0;
            });

            options.AddFixedWindowLimiter("api", opt =>
            {
                opt.PermitLimit = 100;
                opt.Window = TimeSpan.FromMinutes(1);
            });

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

        builder.Services.AddControllers();

        // Add HttpClient for Swagger proxying
        builder.Services.AddHttpClient();

        // SWAGGER
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "API Gateway - All Services",
                Version = "v1",
                Description = "Centralized API Gateway for Grading System Microservices"
            });

            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter JWT token from /api/v1/auth/login"
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
        });

        // ===== YARP Reverse Proxy với Token Forwarding =====
        builder.Services.AddReverseProxy()
            .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
            .AddTransforms(builderContext =>
            {
                // ✅ FIX: Forward Authorization header từ incoming request
                builderContext.AddRequestTransform(async transformContext =>
                {
                    var httpContext = transformContext.HttpContext;

                    // Lấy token từ Authorization header
                    var authHeader = httpContext.Request.Headers.Authorization.ToString();

                    if (!string.IsNullOrEmpty(authHeader))
                    {
                        // Log để debug
                        var logger = httpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                        logger.LogInformation("🔑 Forwarding Authorization header: {AuthHeader}",
                            authHeader.Substring(0, Math.Min(50, authHeader.Length)) + "...");

                        // Remove existing Authorization header if any
                        transformContext.ProxyRequest.Headers.Remove("Authorization");

                        // Add Authorization header to proxied request
                        transformContext.ProxyRequest.Headers.TryAddWithoutValidation(
                            "Authorization", authHeader);
                    }
                    else
                    {
                        var logger = httpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                        logger.LogWarning("No Authorization header found in request to {Path}",
                            httpContext.Request.Path);
                    }
                });

                // Forward additional headers
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

            // ===== Swagger Proxy Endpoints =====
            app.MapGet("/swagger-proxy/identity", async (IHttpClientFactory httpClientFactory) =>
            {
                var client = httpClientFactory.CreateClient();
                client.Timeout = TimeSpan.FromSeconds(10);
                try
                {
                    var response = await client.GetStringAsync("https://localhost:7000/swagger/v1/swagger.json");
                    return Results.Content(response, "application/json");
                }
                catch (HttpRequestException ex)
                {
                    return Results.Problem($"Cannot reach Identity Service: {ex.Message}", statusCode: 503);
                }
                catch (Exception ex)
                {
                    return Results.Problem($"Failed to fetch Identity Service Swagger: {ex.Message}");
                }
            }).ExcludeFromDescription();

            app.MapGet("/swagger-proxy/exam", async (IHttpClientFactory httpClientFactory) =>
            {
                var client = httpClientFactory.CreateClient();
                client.Timeout = TimeSpan.FromSeconds(10);
                try
                {
                    var response = await client.GetStringAsync("https://localhost:7001/swagger/v1/swagger.json");
                    return Results.Content(response, "application/json");
                }
                catch (HttpRequestException ex)
                {
                    return Results.Problem($"Cannot reach Exam Service: {ex.Message}", statusCode: 503);
                }
                catch (Exception ex)
                {
                    return Results.Problem($"Failed to fetch Exam Service Swagger: {ex.Message}");
                }
            }).ExcludeFromDescription();

            app.MapGet("/swagger-proxy/grading", async (IHttpClientFactory httpClientFactory) =>
            {
                var client = httpClientFactory.CreateClient();
                client.Timeout = TimeSpan.FromSeconds(10);
                try
                {
                    var response = await client.GetStringAsync("https://localhost:7002/swagger/v1/swagger.json");
                    return Results.Content(response, "application/json");
                }
                catch (HttpRequestException ex)
                {
                    return Results.Problem($"Cannot reach Grading Service: {ex.Message}", statusCode: 503);
                }
                catch (Exception ex)
                {
                    return Results.Problem($"Failed to fetch Grading Service Swagger: {ex.Message}");
                }
            }).ExcludeFromDescription();

            // SWAGGER UI
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                // Gateway's own endpoints 
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Gateway API");

                // Backend services via proxy endpoints
                c.SwaggerEndpoint("/swagger-proxy/identity", "Identity Service");
                c.SwaggerEndpoint("/swagger-proxy/exam", "Exam Service");
                c.SwaggerEndpoint("/swagger-proxy/grading", "Grading Service");

                c.RoutePrefix = "swagger";
                c.DocumentTitle = "API Gateway - All Services";
                c.EnableDeepLinking();
                c.EnableFilter();
                c.DisplayRequestDuration();
                c.DefaultModelsExpandDepth(-1);
                c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.List);
            });

            // Redirect root to Swagger
            app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();
        }
        else
        {
            app.UseExceptionHandler("/error");
            app.UseHsts();
        }

        app.MapGet("/error", () => Results.Problem("An error occurred."));

        // Request/Response Logging with Token Info
        app.Use(async (context, next) =>
        {
            var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
            var startTime = DateTime.UtcNow;

            var hasAuth = context.Request.Headers.ContainsKey("Authorization");
            var authInfo = hasAuth ? "🔑 With Token" : "🔓 No Token";

            logger.LogInformation(
                "[Gateway IN]  {Method} {Path} from {IP} {AuthInfo}",
                context.Request.Method,
                context.Request.Path,
                context.Connection.RemoteIpAddress,
                authInfo
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

        app.UseHttpsRedirection();
        app.UseCors("AllowLocalhost");

        app.UseResponseCompression();
        app.UseRateLimiter();

        app.UseAuthentication();  
        app.UseAuthorization();   

        app.MapHealthChecks("/health");

        app.MapControllers();

        // MapReverseProxy phải sau Authentication & Authorization
        app.MapReverseProxy();

        app.Run();
    }
}