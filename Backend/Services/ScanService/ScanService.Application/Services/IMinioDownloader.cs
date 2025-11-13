namespace ScanService.Application.Services;

public interface IMinioDownloader
{
    Task<Stream> DownloadFileAsync(
        string bucketName,
        string objectName,
        CancellationToken cancellationToken);
}