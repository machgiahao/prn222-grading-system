using Microsoft.Extensions.Logging;
using ScanService.Application.Services;
using System.Net.Http.Json;
using System.Text.Json.Nodes;

namespace ScanService.Infrastructure.Services;

public class EmbeddingService : IEmbeddingService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<EmbeddingService> _logger;

    private const string EMBEDDING_MODEL_NAME = "nomic-embed-text";

    public EmbeddingService(HttpClient httpClient, ILogger<EmbeddingService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<float[]> GetEmbeddingAsync(string text)
    {
        var payload = new
        {
            model = EMBEDDING_MODEL_NAME,
            prompt = text
        };

        try
        {
            var response = await _httpClient.PostAsJsonAsync("/api/embeddings", payload);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadFromJsonAsync<JsonNode>();
            var embeddingArray = jsonResponse["embedding"].AsArray();

            float[] vector = embeddingArray
                    .Select(node => (float)node.AsValue())
                    .ToArray();

            return vector;
        } catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate embedding from Ollama API.");
            throw;
        }
    }
}
