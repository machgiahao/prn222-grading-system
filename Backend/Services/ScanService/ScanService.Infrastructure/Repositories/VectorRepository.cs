using Grpc.Core;
using Microsoft.Extensions.Logging;
using Qdrant.Client;
using Qdrant.Client.Grpc;
using ScanService.Domain.Repositories;
using System.Collections.Concurrent;

namespace ScanService.Infrastructure.Repositories;

public class VectorRepository : IVectorRepository
{
    private readonly QdrantClient _client;
    private readonly ILogger<VectorRepository> _logger;

    private const uint VECTOR_SIZE = 768;
    private const float SIMILARITY_THRESHOLD = 0.95f;
    private static readonly ConcurrentDictionary<string, bool> _collectionCache = new();

    public VectorRepository(QdrantClient client, ILogger<VectorRepository> logger)
    {
        _client = client;
        _logger = logger;
    }

    public async Task AddVectorAsync(string collectionName, float[] vector, string studentId)
    {
        try
        {
            await EnsureCollectionExistsAsync(collectionName);
            var point = new PointStruct
            {
                Id = new PointId { Uuid = Guid.NewGuid().ToString() },
                Vectors = vector,
                Payload =
                {
                    ["student_id"] = studentId
                }
            };

            await _client.UpsertAsync(collectionName, new[] { point });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to Add/Upsert point to Qdrant collection {CollectionName}. Continuing without vector storage.", collectionName);
        }
    }

    public async Task<List<string>> SearchSimilarAsync(string collectionName, float[] vector)
    {

        try
        {
            await EnsureCollectionExistsAsync(collectionName);
            // Find similar vectors 
            var searchResults = await _client.SearchAsync(
                    collectionName: collectionName,
                    vector: (ReadOnlyMemory<float>)vector, // Cast to ReadOnlyMemory<float>
                    limit: 5,
                    scoreThreshold: SIMILARITY_THRESHOLD,
                    payloadSelector: new WithPayloadSelector { Enable = true }
            );

            // Parse results to get student id
            List<string> similarStudents = searchResults
                    .Select(result => result.Payload["student_id"].StringValue)
                    .ToList();

            return similarStudents;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to Search Qdrant collection {CollectionName}", collectionName);
            return new List<string>();
        }
    }

    private async Task EnsureCollectionExistsAsync(string collectionName)
    {
        if (_collectionCache.ContainsKey(collectionName))
            return;

        try
        {
            var exists = await _client.CollectionExistsAsync(collectionName);
            if (exists)
            {
                _collectionCache.TryAdd(collectionName, true);
                return;
            }

            _logger.LogInformation("Qdrant collection {CollectionName} not found. Creating new one...", collectionName);

            await _client.CreateCollectionAsync(
                collectionName,
                new VectorParams
                {
                    Size = VECTOR_SIZE,
                    Distance = Distance.Cosine
                }
            );

            _collectionCache.TryAdd(collectionName, true);
        }
        catch (RpcException rpcEx) when (rpcEx.StatusCode == StatusCode.AlreadyExists)
        {
            //  handle race condition where collection was created between the exists check and create call
            _collectionCache.TryAdd(collectionName, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to Ensure Qdrant collection {CollectionName} exists", collectionName);
            throw;
        }
    }
}
