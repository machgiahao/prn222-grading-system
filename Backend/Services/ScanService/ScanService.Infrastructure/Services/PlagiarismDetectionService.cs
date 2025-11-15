using Microsoft.Extensions.Logging;
using ScanService.Application.Services;
using ScanService.Domain.Constants;
using ScanService.Domain.Repositories;
using SharedLibrary.Contracts;

namespace ScanService.Infrastructure.Services;

public class PlagiarismDetectionService : IPlagiarismDetectionService
{
    private readonly ILogger<PlagiarismDetectionService> _logger;
    private readonly IEmbeddingService _embeddingService;
    private readonly IVectorRepository _vectorRepository;

    public PlagiarismDetectionService(
        ILogger<PlagiarismDetectionService> logger,
        IEmbeddingService embeddingService,
        IVectorRepository vectorRepository)
    {
        _logger = logger;
        _embeddingService = embeddingService;
        _vectorRepository = vectorRepository;
    }

    public async Task<List<ScanResultItem>> DetectPlagiarismAsync(
        Dictionary<string, string> studentSourceCodes,
        string collectionName)
    {
        _logger.LogInformation("Plagiarism detection for {Count} students", studentSourceCodes.Count);

        var violations = new List<ScanResultItem>();
        var vectors = await GenerateVectorsAsync(studentSourceCodes, collectionName);

        await CheckSimilaritiesAsync(vectors, collectionName, violations);

        return violations;
    }

    private async Task<Dictionary<string, float[]>> GenerateVectorsAsync(
        Dictionary<string, string> sourceCodes,
        string collectionName)
    {
        var vectors = new Dictionary<string, float[]>();

        foreach (var (studentId, code) in sourceCodes)
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                _logger.LogWarning("Student {StudentId} has empty code", studentId);
                continue;
            }

            try
            {
                var vector = await _embeddingService.GetEmbeddingAsync(code);
                vectors.Add(studentId, vector);
                await _vectorRepository.AddVectorAsync(collectionName, vector, studentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate embedding for {StudentId}", studentId);
            }
        }

        return vectors;
    }

    private async Task CheckSimilaritiesAsync(
        Dictionary<string, float[]> vectors,
        string collectionName,
        List<ScanResultItem> violations)
    {
        foreach (var (studentId, vector) in vectors)
        {
            try
            {
                var similar = await _vectorRepository.SearchSimilarAsync(collectionName, vector);
                var matches = similar.Where(s => !s.Equals(studentId, StringComparison.OrdinalIgnoreCase)).ToList();

                if (matches.Any())
                {
                    violations.Add(new ScanResultItem
                    {
                        StudentId = studentId,
                        FilePath = "Student-level plagiarism",
                        ViolationType = ViolationTypes.Plagiarism,
                        Description = $"Similar to: {string.Join(", ", matches)}"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Similarity check failed for {StudentId}", studentId);
            }
        }
    }
}
