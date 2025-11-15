namespace ScanService.Application.Services;

public interface IArchiveExtractorService
{
    Task<ArchiveExtractionResult> ExtractAndProcessAsync(
        Stream archiveStream,
        Func<string, Stream, Task> processStudentZip);
}

public class ArchiveExtractionResult
{
    public List<string> DetectedStudents { get; set; } = new();
    public bool Success { get; set; }
    public string ErrorMessage { get; set; }
}