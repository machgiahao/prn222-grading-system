using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Minio;
using Qdrant.Client;
using ScanService.Application.Services;
using ScanService.Domain.Repositories;
using ScanService.Infrastructure.Configs;
using ScanService.Infrastructure.Repositories;
using ScanService.Infrastructure.Services;
using SharedLibrary.Configs;

namespace ScanService.Infrastructure;

using OurMinioConfig = SharedLibrary.Configs.MinioConfig;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration configuration)
    {
        AppContext.SetSwitch("System.Net.Http.SocketsHttpHandler.Http2UnencryptedSupport", true);
        services.AddHttpClient();
        // Register Minio service
        services.ConfigureOptions<MinioConfigSetup>();
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

        services.AddScoped<IMinioDownloader, MinioDownloaderService>();


        // Register Ollama service
        services.ConfigureOptions<OllamaConfigSetup>();
        services.AddScoped<IEmbeddingService, EmbeddingService>();
        services.AddHttpClient<IEmbeddingService, EmbeddingService>((sp, client) =>
        {
            var ollamaConfig = sp.GetRequiredService<IOptions<OllamaConfig>>().Value;
            client.BaseAddress = new Uri(ollamaConfig.BaseAddress);
        });
        services.AddScoped<IGitHubRepositoryService, GitHubRepositoryService>();

        // Register Qdrant service
        services.ConfigureOptions<QdrantConfigSetup>();
        services.AddSingleton(sp =>
        {
            var qdrantConfig = sp.GetRequiredService<IOptions<QdrantConfig>>().Value;
            var uri = new Uri(qdrantConfig.BaseAddress);
            string host = uri.Host;
            int port = uri.Port;   

            return new QdrantClient(host, port, https: false);
        });
        services.AddScoped<IVectorRepository, VectorRepository>();
        services.AddScoped<IScanLogicService, ScanLogicService>();

        // Register services
        services.AddScoped<IArchiveExtractorService, ArchiveExtractorService>();
        services.AddScoped<ICodeViolationScanner, CodeViolationScanner>();
        services.AddScoped<IPlagiarismDetectionService, PlagiarismDetectionService>();
        services.AddScoped<IScanLogicService, ScanLogicService>();

        return services;
    }
}
