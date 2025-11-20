using SharedLibrary.Contracts;

namespace ScanService.Application.Services;

public interface IScanLogicService
{
    Task<ScanResult> ScanRarFileAsync(
        Stream rarFileStream,
        List<string> forbiddenKeywords,
        Guid submissionBatchId
    );
}

public class ScanResult
{
    public List<ScanResultItem> Violations { get; set; } = new();
    public List<string> StudentCodes { get; set; } = new();
    public Dictionary<string, string> StudentFolders { get; set; } = new();
    public Dictionary<string, string> GitHubUrls { get; set; } = new();
}
