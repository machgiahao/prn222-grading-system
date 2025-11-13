namespace SharedLibrary.Contracts;

public sealed record SubmissionBatchUploadedEvent
{
    public Guid SubmissionBatchId { get; init; }
    public string RarFilePath { get; init; }
    public Guid UploadedByManagerId { get; init; }
    public List<string> ForbiddenKeywords { get; init; }
}
