using Microsoft.Extensions.Logging;
using ScanService.Application.Services;
using ScanService.Domain.Constants;
using ScanService.Domain.Repositories;
using SharedLibrary.Contracts;
using System.IO.Compression;

namespace ScanService.Infrastructure.Services;

public class ScanLogicService : IScanLogicService
{
    private readonly ILogger<ScanLogicService> _logger;
    private readonly IArchiveExtractorService _archiveExtractor;
    private readonly ICodeViolationScanner _codeScanner;
    private readonly IPlagiarismDetectionService _plagiarismDetector;
    private readonly IGitHubRepositoryService _gitHubService;

    public ScanLogicService(
        ILogger<ScanLogicService> logger,
        IArchiveExtractorService archiveExtractor,
        ICodeViolationScanner codeScanner,
        IPlagiarismDetectionService plagiarismDetector,
        IGitHubRepositoryService gitHubService)
    {
        _logger = logger;
        _archiveExtractor = archiveExtractor;
        _codeScanner = codeScanner;
        _plagiarismDetector = plagiarismDetector;
        _gitHubService = gitHubService;
    }

    public async Task<ScanResult> ScanRarFileAsync(
        Stream rarFileStream,
        List<string> forbiddenKeywords,
        Guid submissionBatchId)
    {
        _logger.LogInformation("🚀 Starting scan for batch {BatchId}", submissionBatchId);

        var violations = new List<ScanResultItem>();
        var studentCodes = new Dictionary<string, string>();
        var studentFolders = new Dictionary<string, string>();
        var gitHubUrls = new Dictionary<string, string>();
        var collectionName = submissionBatchId.ToString();

        var batchTempPath = Path.Combine(
            Path.GetTempPath(),
            $"GradingSystem_{submissionBatchId}");

        Directory.CreateDirectory(batchTempPath);

        try
        {
            // Step 1: Extract and scan violations
            var extractionResult = await _archiveExtractor.ExtractAndProcessAsync(
                rarFileStream,
                async (studentId, folderName, zipStream) =>
                {
                    studentFolders[studentId] = folderName;

                    var studentFolderPath = Path.Combine(batchTempPath, folderName);
                    Directory.CreateDirectory(studentFolderPath);

                    // Copy stream to MemoryStream first (RAR streams don't support Seek)
                    using var memoryStream = new MemoryStream();
                    await zipStream.CopyToAsync(memoryStream);
                    memoryStream.Position = 0;

                    // Save solution.zip from MemoryStream
                    var zipFilePath = Path.Combine(studentFolderPath, "solution.zip");
                    using (var fileStream = File.Create(zipFilePath))
                    {
                        await memoryStream.CopyToAsync(fileStream);
                    }

                    // Extract solution.zip contents
                    ZipFile.ExtractToDirectory(zipFilePath, studentFolderPath, overwriteFiles: true);
                    File.Delete(zipFilePath);

                    // Scan violations from MemoryStream (reset position)
                    memoryStream.Position = 0;
                    var scanResult = await _codeScanner.ScanZipAsync(studentId, memoryStream, forbiddenKeywords);
                    violations.AddRange(scanResult.Violations);

                    if (!string.IsNullOrWhiteSpace(scanResult.SourceCode))
                    {
                        if (studentCodes.ContainsKey(studentId))
                        {
                            _logger.LogWarning("Duplicate student {StudentId}, appending code", studentId);
                            studentCodes[studentId] += scanResult.SourceCode;
                        }
                        else
                        {
                            studentCodes[studentId] = scanResult.SourceCode;
                        }
                    }
                });

            if (!extractionResult.Success)
            {
                return CreateErrorResult(CreateSystemError(extractionResult.ErrorMessage));
            }

            // Step 2: Upload to GitHub (AFTER extraction completes)
            var githubTasks = new List<Task<(string StudentId, string Url)>>();

            foreach (var student in extractionResult.DetectedStudents)
            {
                var studentId = student.StudentId;
                var folderName = student.FolderName;
                var studentFolderPath = Path.Combine(batchTempPath, folderName);

                // Add task to list
                var task = Task.Run(async () =>
                {
                    try
                    {
                        var url = await _gitHubService.PushSubmissionToGitHubAsync(
                            studentId,
                            folderName,
                            studentFolderPath,
                            submissionBatchId);

                        return (studentId, url);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "GitHub push failed for {StudentId}", studentId);
                        return (studentId, (string)null);
                    }
                });

                githubTasks.Add(task);
            }

            // Wait for all GitHub uploads to complete BEFORE cleanup
            if (githubTasks.Any())
            {
                _logger.LogInformation("⏳ Waiting for {Count} GitHub uploads...", githubTasks.Count);
                var results = await Task.WhenAll(githubTasks);

                foreach (var (studentId, url) in results)
                {
                    if (!string.IsNullOrEmpty(url))
                    {
                        gitHubUrls[studentId] = url;
                        _logger.LogInformation("✅ GitHub upload completed for {StudentId}", studentId);
                    }
                }
            }

            // Step 3: Plagiarism Detection
            if (studentCodes.Any())
            {
                var plagiarismViolations = await _plagiarismDetector.DetectPlagiarismAsync(
                    studentCodes,
                    collectionName);
                violations.AddRange(plagiarismViolations);
            }

            _logger.LogInformation(
                "Scan completed: {ViolationCount} violations, {StudentCount} students, {GitHubCount} GitHub repos",
                violations.Count,
                extractionResult.DetectedStudents.Count,
                gitHubUrls.Count);
            // Cleanup local repo after all pushes
            await _gitHubService.CleanupLocalRepositoryAsync();
            return new ScanResult
            {
                Violations = violations,
                StudentCodes = extractionResult.DetectedStudents
                    .Select(s => s.StudentId)
                    .Distinct()
                    .ToList(),
                StudentFolders = studentFolders,
                GitHubUrls = gitHubUrls
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Critical scan error for batch {BatchId}", submissionBatchId);
            return CreateErrorResult(CreateSystemError(ex.Message));
        }
        finally
        {
            try
            {
                if (Directory.Exists(batchTempPath))
                {
                    Directory.Delete(batchTempPath, recursive: true);
                    _logger.LogInformation("Cleaned up temp folder: {Path}", batchTempPath);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to cleanup temp folder: {Path}", batchTempPath);
            }
        }
    }

    private ScanResultItem CreateSystemError(string message) => new()
    {
        StudentId = "SYSTEM_ERROR",
        FilePath = "Batch-level error",
        ViolationType = ViolationTypes.ScanError,
        Description = $"Scan failed: {message}"
    };

    private ScanResult CreateErrorResult(ScanResultItem error) => new()
    {
        Violations = new List<ScanResultItem> { error },
        StudentCodes = new List<string>(),
        StudentFolders = new Dictionary<string, string>(),
        GitHubUrls = new Dictionary<string, string>()
    };
}