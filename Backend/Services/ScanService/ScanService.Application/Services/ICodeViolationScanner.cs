using SharedLibrary.Contracts;

namespace ScanService.Application.Services;

public interface ICodeViolationScanner
{
    Task<CodeScanResult> ScanZipAsync(
        string studentId,
        Stream zipStream,
        List<string> forbiddenKeywords);
}

public class CodeScanResult
{
    public string StudentId { get; set; }
    public string SourceCode { get; set; }
    public List<ScanResultItem> Violations { get; set; } = new();
}
