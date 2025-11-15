using Microsoft.Extensions.Logging;
using ScanService.Application.Services;
using ScanService.Domain.Constants;
using SharedLibrary.Contracts;
using System.IO.Compression;
using System.Text;
using System.Text.RegularExpressions;

namespace ScanService.Infrastructure.Services;

public class CodeViolationScanner : ICodeViolationScanner
{
    private readonly ILogger<CodeViolationScanner> _logger;
    private static readonly string[] JunkPaths = { ".vs/", "/bin/", "/obj/" };

    public CodeViolationScanner(ILogger<CodeViolationScanner> logger)
    {
        _logger = logger;
    }

    public async Task<CodeScanResult> ScanZipAsync(
        string studentId,
        Stream zipStream,
        List<string> forbiddenKeywords)
    {
        var result = new CodeScanResult { StudentId = studentId };
        var sourceCode = new StringBuilder();

        using var zipArchive = new ZipArchive(zipStream, ZipArchiveMode.Read);

        foreach (var entry in zipArchive.Entries)
        {
            if (IsJunkPath(entry.FullName)) continue;

            if (entry.FullName.EndsWith(".sln", StringComparison.OrdinalIgnoreCase))
            {
                CheckSolutionNaming(entry.FullName, studentId, result.Violations);
            }

            if (entry.FullName.EndsWith(".cs", StringComparison.OrdinalIgnoreCase))
            {
                var content = await ReadFileAsync(entry);
                CheckForbiddenKeywords(content, forbiddenKeywords, entry.FullName, studentId, result.Violations);
                sourceCode.Append(content);
            }
        }

        result.SourceCode = sourceCode.ToString();
        return result;
    }

    private void CheckSolutionNaming(string slnName, string studentId, List<ScanResultItem> violations)
    {
        if (!Regex.IsMatch(slnName, NamingRules.SolutionFileRegex, RegexOptions.IgnoreCase))
        {
            violations.Add(new ScanResultItem
            {
                StudentId = studentId,
                FilePath = slnName,
                ViolationType = ViolationTypes.Naming,
                Description = $"Invalid solution file name: '{slnName}'"
            });
        }
    }

    private void CheckForbiddenKeywords(
        string content,
        List<string> keywords,
        string filePath,
        string studentId,
        List<ScanResultItem> violations)
    {
        foreach (var keyword in keywords)
        {
            if (content.Contains(keyword, StringComparison.OrdinalIgnoreCase))
            {
                violations.Add(new ScanResultItem
                {
                    StudentId = studentId,
                    FilePath = filePath,
                    ViolationType = ViolationTypes.Keyword,
                    Description = $"Forbidden keyword: '{keyword}'"
                });
            }
        }
    }

    private async Task<string> ReadFileAsync(ZipArchiveEntry entry)
    {
        using var stream = entry.Open();
        using var reader = new StreamReader(stream, Encoding.UTF8);
        return await reader.ReadToEndAsync();
    }

    private bool IsJunkPath(string path) =>
        JunkPaths.Any(j => path.Contains(j, StringComparison.OrdinalIgnoreCase));
}
