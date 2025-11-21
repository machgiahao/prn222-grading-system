using Microsoft.AspNetCore.Http;

namespace GradingService.Application.Services;

public interface IFileStorageService
{
    Task<string> UploadAsync(IFormFile file, string bucketName, CancellationToken cancellationToken);

    Task DeleteAsync(string filePath, string bucketName, CancellationToken cancellationToken);
}
