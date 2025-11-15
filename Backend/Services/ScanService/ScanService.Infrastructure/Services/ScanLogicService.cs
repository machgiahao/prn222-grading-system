using Microsoft.Extensions.Logging;
using ScanService.Application.Services;
using ScanService.Domain.Constants;
using SharedLibrary.Contracts;

namespace ScanService.Infrastructure.Services;

public class ScanLogicService : IScanLogicService
{
    private readonly ILogger<ScanLogicService> _logger;
    private readonly IArchiveExtractorService _archiveExtractor;
    private readonly ICodeViolationScanner _codeScanner;
    private readonly IPlagiarismDetectionService _plagiarismDetector;

    public ScanLogicService(
        ILogger<ScanLogicService> logger,
        IArchiveExtractorService archiveExtractor,
        ICodeViolationScanner codeScanner,
        IPlagiarismDetectionService plagiarismDetector)
    {
        _logger = logger;
        _archiveExtractor = archiveExtractor;
        _codeScanner = codeScanner;
        _plagiarismDetector = plagiarismDetector;
    }

    public async Task<ScanResult> ScanRarFileAsync(
        Stream rarFileStream,
        List<string> forbiddenKeywords,
        Guid submissionBatchId)
    {
        _logger.LogInformation("Starting scan for batch {BatchId}", submissionBatchId);

        var violations = new List<ScanResultItem>();
        var studentCodes = new Dictionary<string, string>();
        var collectionName = submissionBatchId.ToString();

        try
        {
            // Phase 1: Extract & Scan
            var extractionResult = await _archiveExtractor.ExtractAndProcessAsync(
                rarFileStream,
                async (studentId, zipStream) =>
                {
                    var scanResult = await _codeScanner.ScanZipAsync(studentId, zipStream, forbiddenKeywords);
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
                violations.Add(CreateSystemError(extractionResult.ErrorMessage));
                return new ScanResult { Violations = violations, StudentCodes = new List<string>() };
            }

            // Phase 2: Plagiarism Detection
            if (studentCodes.Any())
            {
                var plagiarismViolations = await _plagiarismDetector.DetectPlagiarismAsync(studentCodes, collectionName);
                violations.AddRange(plagiarismViolations);
            }

            _logger.LogInformation("Scan completed: {ViolationCount} violations, {StudentCount} students",
                violations.Count, extractionResult.DetectedStudents.Count);

            return new ScanResult
            {
                Violations = violations,
                StudentCodes = extractionResult.DetectedStudents.Distinct().ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Critical scan error for batch {BatchId}", submissionBatchId);
            violations.Add(CreateSystemError(ex.Message));
            return new ScanResult { Violations = violations, StudentCodes = new List<string>() };
        }
    }

    private ScanResultItem CreateSystemError(string message) => new()
    {
        StudentId = "SYSTEM_ERROR",
        FilePath = "Batch-level error",
        ViolationType = ViolationTypes.ScanError,
        Description = $"Scan failed: {message}"
    };
}