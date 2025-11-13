using Microsoft.Extensions.Logging;
using Minio;
using Minio.DataModel.Args;
using ScanService.Application.Services;
using System.IO;

namespace ScanService.Infrastructure.Services;

public class MinioDownloaderService : IMinioDownloader
{
    private readonly IMinioClient _minioClient;
    private readonly ILogger<MinioDownloaderService> _logger;

    public MinioDownloaderService(IMinioClient minioClient, ILogger<MinioDownloaderService> logger)
    {
        _minioClient = minioClient;
        _logger = logger;
    }

    public async Task<Stream> DownloadFileAsync(
        string bucketName,
        string objectName,
        CancellationToken cancellationToken)
    {
        var memoryStream = new MemoryStream();
        try
        {
            _logger.LogInformation("Attempting to download: Bucket={Bucket}, Object={Object}", bucketName, objectName);

            var args = new GetObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectName)
                .WithCallbackStream(stream =>
                {
                    stream.CopyTo(memoryStream);
                });

            await _minioClient.GetObjectAsync(args, cancellationToken);

            _logger.LogInformation("Successfully downloaded file: {ObjectName} ({Size} bytes) from MinIO.", objectName, memoryStream.Length);
            memoryStream.Position = 0;
            return memoryStream;
        }
        catch (Exception ex)
        {
            memoryStream.Dispose();
            _logger.LogError(ex, "Failed to download from MinIO. Bucket={Bucket}, Object={Object}", bucketName, objectName);
            throw;
        }
    }
}
