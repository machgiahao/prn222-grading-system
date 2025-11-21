using GradingService.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Minio;
using Minio.DataModel.Args;
using Minio.Exceptions;

namespace GradingService.Infrastructure.Services;

public class MinioStorageService : IFileStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly ILogger<MinioStorageService> _logger;

    public MinioStorageService(IMinioClient minioClient, ILogger<MinioStorageService> logger)
    {
        _minioClient = minioClient;
        _logger = logger;
    }

    public async Task<string> UploadAsync(IFormFile file, string bucketName, CancellationToken cancellationToken)
    {
        try
        {
            var beArgs = new BucketExistsArgs().WithBucket(bucketName);
            bool found = await _minioClient.BucketExistsAsync(beArgs, cancellationToken);
            if (!found)
            {
                // check bucket existence
                var mbArgs = new MakeBucketArgs().WithBucket(bucketName);
                await _minioClient.MakeBucketAsync(mbArgs, cancellationToken);
                _logger.LogInformation("Bucket '{BucketName}' is created.", bucketName);
            }

            // create unique file name
            var fileExtension = Path.GetExtension(file.FileName);
            var objectName = $"{Guid.NewGuid()}{fileExtension}";

            using (var stream = file.OpenReadStream())
            {
                var poArgs = new PutObjectArgs()
                    .WithBucket(bucketName)
                    .WithObject(objectName)
                    .WithStreamData(stream)
                    .WithObjectSize(file.Length)
                    .WithContentType(file.ContentType);

                await _minioClient.PutObjectAsync(poArgs, cancellationToken);
            }

            _logger.LogInformation(
                    "File '{FileName}' has been uploaded to '{BucketName}' with the name '{ObjectName}'.",
                    file.FileName, bucketName, objectName);

            // return unique file name
            return objectName;

        }
        catch (MinioException e)
        {
            _logger.LogError(e, "A Minio error occurred while uploading the file.");
            throw new ApplicationException("File storage error.", e);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "An unknown error occurred while uploading the file.");
            throw;
        }
    }

    public async Task DeleteAsync(
        string filePath,
        string bucketName,
        CancellationToken cancellationToken)
    {
        try
        {
            var removeObjectArgs = new RemoveObjectArgs()
                .WithBucket(bucketName)
                .WithObject(filePath);

            await _minioClient.RemoveObjectAsync(removeObjectArgs, cancellationToken);

            _logger.LogInformation("File deleted successfully: {BucketName}/{FilePath}", bucketName, filePath);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete file from MinIO: {BucketName}/{FilePath}", bucketName, filePath);
        }
    }
}
