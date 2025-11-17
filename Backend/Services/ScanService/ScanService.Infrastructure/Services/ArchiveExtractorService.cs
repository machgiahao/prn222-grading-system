using Microsoft.Extensions.Logging;
using ScanService.Application.Services;
using SharpCompress.Archives;
using System.Text.RegularExpressions;

namespace ScanService.Infrastructure.Services;

public class ArchiveExtractorService : IArchiveExtractorService
{
    private readonly ILogger<ArchiveExtractorService> _logger;
    private static readonly string[] JunkPaths = { ".vs/", "/bin/", "/obj/", "bin/", "obj/" };
    private static readonly Regex StudentIdRegex = new(@"SE\d{6}", RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public ArchiveExtractorService(ILogger<ArchiveExtractorService> logger)
    {
        _logger = logger;
    }

    public async Task<ArchiveExtractionResult> ExtractAndProcessAsync(
        Stream archiveStream,
        Func<string, string, Stream, Task> processStudentZip)
    {
        var result = new ArchiveExtractionResult { Success = true };

        try
        {
            if (!await ValidateArchiveAsync(archiveStream))
            {
                result.Success = false;
                result.ErrorMessage = "Invalid or unsupported archive format";
                return result;
            }

            using var archive = ArchiveFactory.Open(archiveStream);

            foreach (var entry in archive.Entries)
            {
                if (!IsValidSolutionZip(entry)) continue;

                var (studentId, folderName) = ExtractStudentInfo(entry.Key);

                if (string.IsNullOrEmpty(studentId))
                {
                    _logger.LogWarning("Could not extract StudentId from path: {Path}", entry.Key);
                    continue;
                }

                result.DetectedStudents.Add(new StudentSubmissionInfo
                {
                    StudentId = studentId,
                    FolderName = folderName
                });

                _logger.LogInformation(
                    "Processing solution for student: {StudentId} from folder: {FolderName}",
                    studentId,
                    folderName);

                using var zipStream = entry.OpenEntryStream();
                await processStudentZip(studentId, folderName, zipStream);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Archive extraction failed");
            result.Success = false;
            result.ErrorMessage = ex.Message;
        }

        return result;
    }

    private async Task<bool> ValidateArchiveAsync(Stream stream)
    {
        // Ensure the stream is seekable
        if (!stream.CanSeek)
        {
            var tmp = new MemoryStream();
            await stream.CopyToAsync(tmp);
            tmp.Position = 0;
            stream = tmp;
        }
        else
        {
            stream.Position = 0;
        }

        // Read the first 16 bytes to detect format (from magic bytes)
        byte[] header = new byte[16];
        int read = await stream.ReadAsync(header, 0, header.Length);
        stream.Position = 0;

        var (isValid, format) = DetectFormat(header, read);

        if (isValid)
        {
            _logger.LogInformation("Detected archive format: {Format}", format);
        }
        else
        {
            _logger.LogError("Unsupported format: {Format}", format);
        }

        return isValid;
    }

    private (bool IsValid, string Format) DetectFormat(byte[] header, int read)
    {
        if (read >= 2 && header[0] == 0x50 && header[1] == 0x4B) return (true, "ZIP");
        if (read >= 4 && header[0] == 0x52 && header[1] == 0x61 && header[2] == 0x72 && header[3] == 0x21) return (true, "RAR");
        if (read >= 6 && header[0] == 0x37 && header[1] == 0x7A) return (true, "7Z");
        if (read >= 2 && header[0] == 0x1F && header[1] == 0x8B) return (true, "GZIP");
        return (false, "Unknown");
    }

    private bool IsValidSolutionZip(IArchiveEntry entry)
    {
        var path = entry.Key.Replace("\\", "/");
        return !entry.IsDirectory
            && !IsJunkPath(path)
            && path.EndsWith("/solution.zip", StringComparison.OrdinalIgnoreCase);
    }

    private bool IsJunkPath(string path) =>
        JunkPaths.Any(j => path.Contains(j, StringComparison.OrdinalIgnoreCase));

    /// <summary>
    /// Extracts student ID (SE + 6 digits) and folder name from archive path
    /// Example: "PRN222_SU25.../DanhPTSE184514/0/solution.zip" 
    /// Returns: (StudentId: "SE184514", FolderName: "DanhPTSE184514")
    /// </summary>
    private (string StudentId, string FolderName) ExtractStudentInfo(string path)
    {
        try
        {
            var parts = path.Split(new[] { '/', '\\' }, StringSplitOptions.RemoveEmptyEntries);

            string studentFolder = null;
            string studentId = null;

            foreach (var part in parts)
            {
                var match = StudentIdRegex.Match(part);
                if (match.Success)
                {
                    studentId = match.Value.ToUpper(); // Normalize to uppercase SE123456
                    studentFolder = part;
                    break;
                }
            }

            if (string.IsNullOrEmpty(studentId))
            {
                _logger.LogWarning("Could not find SE+6digits pattern in path: {Path}", path);
                return (null, null);
            }

            _logger.LogDebug(
                "Extracted StudentId: {StudentId}, FolderName: {FolderName} from path: {Path}",
                studentId,
                studentFolder,
                path);

            return (studentId, studentFolder);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting student info from path: {Path}", path);
            return (null, null);
        }
    }
}