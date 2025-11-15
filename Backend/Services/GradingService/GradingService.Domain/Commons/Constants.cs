namespace GradingService.Domain.Commons;

public static class StorageBuckets
{
    public const string SubmissionBatches = "submissions";
}

public static class SubmissionStatus
{
    public const string Pending = "Pending";
    public const string Scanning = "Scanning";
    public const string Completed = "Completed";
    public const string ReadyToGrade = "ReadyToGrade";
    public const string Graded = "Graded";
    public const string Verified = "Verified";
    public const string Flagged = "Flagged";
    public const string Assigned = "Assigned";
}


public static class BatchStatus
{
    public const string PendingScan = "PendingScan";

    public const string Scanned_Clean = "Scanned_Clean";

    public const string Scanned_Violations = "Scanned_Violations";

    public const string Scanned_Error = "Scanned_Error";

    public const string GradingInProgress = "GradingInProgress";

    public const string GradingCompleted = "GradingCompleted";
}
