namespace SharedLibrary.Contracts;

public sealed record ScanResultItem
{
    public string StudentId { get; init; }

    public string FilePath { get; init; }

    public string ViolationType { get; init; }

    public string Description { get; init; }
}

public sealed record ScanCompletedEvent
{
    public Guid SubmissionBatchId { get; init; }
    public Guid UploadedByManagerId { get; init; }
    public List<ScanResultItem> Violations { get; init; }
    public List<string> StudentCodes { get; init; }
    public Dictionary<string, string> StudentFolders { get; init; } = new();
}