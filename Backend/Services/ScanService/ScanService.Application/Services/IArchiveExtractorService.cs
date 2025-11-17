namespace ScanService.Application.Services;

public interface IArchiveExtractorService
{
    Task<ArchiveExtractionResult> ExtractAndProcessAsync(
        Stream archiveStream,
        Func<string, string, Stream, Task> processStudentZip);
}

public class ArchiveExtractionResult
{
    public List<StudentSubmissionInfo> DetectedStudents { get; set; } = new();
    public bool Success { get; set; }
    public string ErrorMessage { get; set; }
}

public class StudentSubmissionInfo
{
    public string StudentId { get; set; }
    public string FolderName { get; set; }
}