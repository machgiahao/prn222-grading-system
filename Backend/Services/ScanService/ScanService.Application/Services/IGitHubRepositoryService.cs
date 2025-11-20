namespace ScanService.Domain.Repositories;

public interface IGitHubRepositoryService
{
    Task<string> PushSubmissionToGitHubAsync(
        string studentId,
        string folderName,
        string extractedFolderPath,
        Guid submissionBatchId);

    Task DeleteRepositoryAsync(string studentId, Guid submissionBatchId);
    Task CleanupLocalRepositoryAsync();
}
