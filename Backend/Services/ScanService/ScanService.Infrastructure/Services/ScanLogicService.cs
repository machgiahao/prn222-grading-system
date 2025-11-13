using Microsoft.Extensions.Logging;
using ScanService.Application.Services;
using ScanService.Domain.Constants;
using SharedLibrary.Contracts;
using SharpCompress.Archives;
using System.IO.Compression;
using System.Text.RegularExpressions;
using System.Text;
using ScanService.Domain.Repositories;

namespace ScanService.Infrastructure.Services;

public class ScanLogicService : IScanLogicService
{
    private readonly ILogger<ScanLogicService> _logger;
    private readonly IEmbeddingService _embeddingService;
    private readonly IVectorRepository _vectorRepo;

    private static readonly string[] JunkPaths = { ".vs/", "/bin/", "/obj/", "bin/", "obj/" };

    public ScanLogicService(
            ILogger<ScanLogicService> logger,
            IEmbeddingService embeddingService,
            IVectorRepository vectorRepo
        )
    {
        _logger = logger;
        _embeddingService = embeddingService;
        _vectorRepo = vectorRepo;
    }

    public async Task<ScanResult> ScanRarFileAsync(
            Stream rarFileStream,
            List<string> forbiddenKeywords,
            Guid submissionBatchId)
    {
        var violations = new List<ScanResultItem>();
        var allStudentSourceCode = new Dictionary<string, string>();
        // Use Id for batch collection name in Qdrant
        string collectionName = submissionBatchId.ToString();
        var detectedStudents = new List<string>();
        try
        {
            _logger.LogInformation($"...Starting Pass 1 (Extraction & Rules 1, 2) for collection '{collectionName}'.");
            if (!rarFileStream.CanSeek)
            {
                var tmp = new MemoryStream();
                await rarFileStream.CopyToAsync(tmp);
                tmp.Position = 0;
                rarFileStream = tmp;
            }
            else
            {
                try
                {
                    rarFileStream.Position = 0;
                }
                catch { }
            }

            // Read first bytes for logging and format detection
            byte[] header = new byte[16];
            int headerRead = await rarFileStream.ReadAsync(header, 0, header.Length);
            rarFileStream.Position = 0;

            _logger.LogInformation("Archive stream length: {Length} bytes, header (hex): {HeaderHex}",
                rarFileStream.Length, BitConverter.ToString(header, 0, Math.Max(0, headerRead)));

            bool isArchive = false;
            string detected = "Unknown";
            if (headerRead >= 2 && header[0] == 0x50 && header[1] == 0x4B) { isArchive = true; detected = "ZIP"; }
            else if (headerRead >= 4 && header[0] == 0x52 && header[1] == 0x61 && header[2] == 0x72 && header[3] == 0x21) { isArchive = true; detected = "RAR"; }
            else if (headerRead >= 6 && header[0] == 0x37 && header[1] == 0x7A && header[2] == 0xBC && header[3] == 0xAF && header[4] == 0x27 && header[5] == 0x1C) { isArchive = true; detected = "7Z"; }
            else if (headerRead >= 2 && header[0] == 0x1F && header[1] == 0x8B) { isArchive = true; detected = "GZIP"; }
            else if (headerRead >= 4 && header[0] == 0x75 && header[1] == 0x73 && header[2] == 0x74 && header[3] == 0x61) { isArchive = true; detected = "TAR (ustar)"; }

            if (!isArchive)
            {
                _logger.LogError("Uploaded stream is not a supported archive (detected: {Detected}). Header bytes: {HeaderHex}", detected, BitConverter.ToString(header, 0, headerRead));
                violations.Add(new ScanResultItem
                {
                    FilePath = "N/A",
                    ViolationType = ViolationTypes.ScanError,
                    Description = $"Uploaded file is not a supported archive (detected: {detected})."
                });
                return new ScanResult
                {
                    Violations = violations,
                    StudentCodes = new List<string>()
                };
            }

            _logger.LogInformation("Detected archive format: {Detected}", detected);

            using (var rarArchive = ArchiveFactory.Open(rarFileStream))
            {
                foreach (var entry in rarArchive.Entries)
                {
                    var entryPath = entry.Key.Replace("\\", "/");
                    if (entry.IsDirectory || IsJunkPath(entryPath)) continue;

                    // Search for solution.zip files
                    if (entryPath.EndsWith("/solution.zip", StringComparison.OrdinalIgnoreCase))
                    {
                        // Extract StudentId from path
                        string studentId = ExtractStudentIdFromPath(entryPath);
                        if (string.IsNullOrEmpty(studentId))
                        {
                            _logger.LogWarning($"Could not extract StudentId from path: {entryPath}");
                            continue;
                        }
                        detectedStudents.Add(studentId);

                        _logger.LogInformation($"...Processing solution for Student: {studentId} (Path: {entryPath})");
                        var studentSourceCode = new StringBuilder();

                        // Extract and scan the zip file
                        using (var zipStream = entry.OpenEntryStream())
                        using (var zipArchive = new ZipArchive(zipStream, ZipArchiveMode.Read))
                        {
                            foreach (var zipEntry in zipArchive.Entries)
                            {
                                if (IsJunkPath(zipEntry.FullName)) continue;

                                if (zipEntry.FullName.EndsWith(".sln", StringComparison.OrdinalIgnoreCase))
                                {
                                    // Check sln name
                                    CheckSolutionNaming(zipEntry.FullName, entryPath, studentId, violations);
                                }

                                if (zipEntry.FullName.EndsWith(".cs", StringComparison.OrdinalIgnoreCase))
                                {
                                    string content = await ReadStreamContentAsync(zipEntry.Open());
                                    // Check forbidden keywords
                                    CheckForbiddenKeywords(content, forbiddenKeywords, entryPath, zipEntry.FullName, studentId, violations);
                                    studentSourceCode.Append(content);
                                }
                            }
                        }

                        // Store or append the student's source code
                        if (allStudentSourceCode.ContainsKey(studentId))
                        {
                            _logger.LogWarning($"Duplicate StudentId '{studentId}' found. Appending source code.");
                            allStudentSourceCode[studentId] += studentSourceCode.ToString();
                        }
                        else
                        {
                            allStudentSourceCode.Add(studentId, studentSourceCode.ToString());
                        }
                    }
                }
            }

            // Create vectors and store them
            _logger.LogInformation($"...Starting Pass 2 (Vector Generation & Storage) for {allStudentSourceCode.Count} students.");
            var studentVectors = new Dictionary<string, float[]>();

            foreach (var student in allStudentSourceCode)
            {
                string studentId = student.Key;
                string sourceCode = student.Value;

                if (string.IsNullOrWhiteSpace(sourceCode))
                {
                    _logger.LogWarning($"Student {studentId} submitted empty source code. Skipping vector generation.");
                    continue;
                }

                float[] vector = await _embeddingService.GetEmbeddingAsync(sourceCode);
                studentVectors.Add(studentId, vector);
                await _vectorRepo.AddVectorAsync(collectionName, vector, studentId);
            }

            // Check plagiarism
            _logger.LogInformation($"...Starting Pass 3 (Plagiarism Search) for {studentVectors.Count} students.");

            foreach (var student in studentVectors)
            {
                string studentId = student.Key;
                float[] vector = student.Value;

                var similarStudents = await _vectorRepo.SearchSimilarAsync(collectionName, vector);

                var otherMatches = similarStudents
                    .Where(s => !string.Equals(s, studentId, StringComparison.OrdinalIgnoreCase))
                    .ToList();

                if (otherMatches.Any())
                {
                    violations.Add(new ScanResultItem
                    {                
                        StudentId = studentId,
                        FilePath = "Student-level plagiarism",
                        ViolationType = ViolationTypes.Plagiarism,
                        Description = $"Plagiarism detected. Similar to: {string.Join(", ", otherMatches)}"
                    });
                }
            }

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Critical error during file extraction or scanning.");
            violations.Add(new ScanResultItem
            {
                StudentId = "SYSTEM_ERROR",
                FilePath = "Batch-level error",
                ViolationType = ViolationTypes.ScanError,
                Description = $"Extraction error: {ex.Message}"
            });
        }

        return new ScanResult
        {
            Violations = violations,
            StudentCodes = detectedStudents.Distinct().ToList()
        };
    }

    private bool IsJunkPath(string path)
    {
        return JunkPaths.Any(junk => path.Contains(junk, StringComparison.OrdinalIgnoreCase));
    }

    private string ExtractStudentIdFromPath(string rarEntryPath)
    {
        var parts = rarEntryPath.Split(new[] { '/', '\\' }, StringSplitOptions.RemoveEmptyEntries);

        if (parts.Length > 1)
        {
            return parts[1];
        }
        return null;
    }

    private void CheckSolutionNaming(string slnName, string zipPath, string studentId, List<ScanResultItem> violations)
    {
        if (!Regex.IsMatch(slnName, NamingRules.SolutionFileRegex, RegexOptions.IgnoreCase))
        {
            violations.Add(new ScanResultItem
            {
                StudentId = studentId,
                FilePath = slnName,
                ViolationType = ViolationTypes.Naming,
                Description = $"Solution file name does not match standard: '{slnName}'"
            });
        }
    }

    private void CheckForbiddenKeywords(string content, List<string> forbiddenKeywords, string zipPath, string csFilePath, string studentId, List<ScanResultItem> violations)
    {
        foreach (var keyword in forbiddenKeywords)
        {
            if (content.Contains(keyword, StringComparison.OrdinalIgnoreCase))
            {
                violations.Add(new ScanResultItem
                {
                    StudentId = studentId,
                    FilePath = csFilePath,
                    ViolationType = ViolationTypes.Keyword,
                    Description = $"Forbidden keyword detected: '{keyword}'"
                });
            }
        }
    }

    private async Task<string> ReadStreamContentAsync(Stream stream)
    {
        using (var reader = new StreamReader(stream, Encoding.UTF8))
        {
            return await reader.ReadToEndAsync();
        }
    }
}
