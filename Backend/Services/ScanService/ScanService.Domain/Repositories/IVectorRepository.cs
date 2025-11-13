namespace ScanService.Domain.Repositories;

public interface IVectorRepository
{
    Task AddVectorAsync(string collectionName, float[] vector, string studentId);

    Task<List<string>> SearchSimilarAsync(string collectionName, float[] vector);
}
