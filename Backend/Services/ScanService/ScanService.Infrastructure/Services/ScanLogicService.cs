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
    private readonly IScanProgressService _progressService; 

    public ScanLogicService(
        ILogger<ScanLogicService> logger,
        IArchiveExtractorService archiveExtractor,
        ICodeViolationScanner codeScanner,
        IPlagiarismDetectionService plagiarismDetector,
        IGitHubRepositoryService gitHubService,
        IScanProgressService progressService) 
    {
        _logger = logger;
        _archiveExtractor = archiveExtractor;
        _codeScanner = codeScanner;
        _plagiarismDetector = plagiarismDetector;
        _gitHubService = gitHubService;
        _progressService = progressService; 
    }

    public async Task<ScanResult> ScanRarFileAsync(
        Stream rarFileStream,
        List<string> forbiddenKeywords,
        Guid submissionBatchId)
    {
        _logger.LogInformation("Starting scan for batch {BatchId}", submissionBatchId);

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
            //Stage 1: Extraction (0-30%)
            await _progressService.ReportProgressAsync(
                submissionBatchId, 0, "Scanning",
                "Starting extraction...", default);

            int processedCount = 0;
            var extractionResult = await _archiveExtractor.ExtractAndProcessAsync(
                rarFileStream,
                async (studentId, folderName, zipStream) =>
                {
                    studentFolders[studentId] = folderName;

                    var studentFolderPath = Path.Combine(batchTempPath, folderName);
                    Directory.CreateDirectory(studentFolderPath);

                    using var memoryStream = new MemoryStream();
                    await zipStream.CopyToAsync(memoryStream);
                    memoryStream.Position = 0;

                    var zipFilePath = Path.Combine(studentFolderPath, "solution.zip");
                    using (var fileStream = File.Create(zipFilePath))
                    {
                        await memoryStream.CopyToAsync(fileStream);
                    }

                    ZipFile.ExtractToDirectory(zipFilePath, studentFolderPath, overwriteFiles: true);
                    File.Delete(zipFilePath);

                    memoryStream.Position = 0;
                    var scanResult = await _codeScanner.ScanZipAsync(
                        studentId, memoryStream, forbiddenKeywords);
                    violations.AddRange(scanResult.Violations);

                    if (!string.IsNullOrWhiteSpace(scanResult.SourceCode))
                    {
                        if (studentCodes.ContainsKey(studentId))
                        {
                            _logger.LogWarning("Duplicate student {StudentId}", studentId);
                            studentCodes[studentId] += scanResult.SourceCode;
                        }
                        else
                        {
                            studentCodes[studentId] = scanResult.SourceCode;
                        }
                    }

                    //Report extraction progress
                    processedCount++;
                    var extractPercent = Math.Min(30, (processedCount * 30) / Math.Max(1, studentFolders.Count));
                    await _progressService.ReportProgressAsync(
                        submissionBatchId,
                        extractPercent,
                        "Scanning",
                        $"Extracted {processedCount} submissions...",
                        default);
                });

            if (!extractionResult.Success)
            {
                await _progressService.ReportErrorAsync(
                    submissionBatchId,
                    extractionResult.ErrorMessage,
                    default);
                return CreateErrorResult(CreateSystemError(extractionResult.ErrorMessage));
            }

            await _progressService.ReportProgressAsync(
                submissionBatchId, 30, "Scanning",
                "Extraction completed", default);

            //Stage 2: GitHub Upload (30-70%)
            await _progressService.ReportProgressAsync(
                submissionBatchId, 35, "GitHub Upload",
                "Uploading to GitHub...", default);

            var githubTasks = new List<Task<(string StudentId, string Url)>>();

            foreach (var student in extractionResult.DetectedStudents)
            {
                var studentId = student.StudentId;
                var folderName = student.FolderName;
                var studentFolderPath = Path.Combine(batchTempPath, folderName);

                var task = Task.Run(async () =>
                {
                    try
                    {
                        var url = await _gitHubService.PushSubmissionToGitHubAsync(
                            studentId, folderName, studentFolderPath, submissionBatchId);
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

            if (githubTasks.Any())
            {
                _logger.LogInformation("⏳ Waiting for {Count} GitHub uploads...", githubTasks.Count);

                var results = await Task.WhenAll(githubTasks);
                int completedGitHub = 0;

                foreach (var (studentId, url) in results)
                {
                    if (!string.IsNullOrEmpty(url))
                    {
                        gitHubUrls[studentId] = url;
                        completedGitHub++;

                        //Report GitHub progress
                        var gitHubPercent = 35 + ((completedGitHub * 35) / githubTasks.Count);
                        await _progressService.ReportProgressAsync(
                            submissionBatchId,
                            gitHubPercent,
                            "GitHub Upload",
                            $"Uploaded {completedGitHub}/{githubTasks.Count} to GitHub",
                            default);
                    }
                }
            }

            await _progressService.ReportProgressAsync(
                submissionBatchId, 70, "GitHub Upload",
                "GitHub upload completed", default);

            //Stage 3: Plagiarism Detection (70-95%)
            await _progressService.ReportProgressAsync(
                submissionBatchId, 75, "Plagiarism Check",
                "Detecting plagiarism...", default);

            if (studentCodes.Any())
            {
                var plagiarismViolations = await _plagiarismDetector.DetectPlagiarismAsync(
                    studentCodes, collectionName);
                violations.AddRange(plagiarismViolations);
            }

            await _progressService.ReportProgressAsync(
                submissionBatchId, 95, "Plagiarism Check",
                "Plagiarism check completed", default);

            //Stage 4: Cleanup & Complete (95-100%)
            await _progressService.ReportProgressAsync(
                submissionBatchId, 98, "Finalizing",
                "Cleaning up...", default);

            await _gitHubService.CleanupLocalRepositoryAsync();

            _logger.LogInformation(
                "Scan completed: {ViolationCount} violations, {StudentCount} students, {GitHubCount} GitHub repos",
                violations.Count,
                extractionResult.DetectedStudents.Count,
                gitHubUrls.Count);

            //Report completion
            await _progressService.ReportCompletedAsync(
                submissionBatchId,
                extractionResult.DetectedStudents.Count,
                default);

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

            await _progressService.ReportErrorAsync(
                submissionBatchId,
                ex.Message,
                default);

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