using SharedLibrary.Contracts;

namespace ScanService.Application.Services;

public interface IPlagiarismDetectionService
{
    Task<List<ScanResultItem>> DetectPlagiarismAsync(
        Dictionary<string, string> studentSourceCodes,
        string collectionName);
}
