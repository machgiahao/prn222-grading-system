namespace SharedLibrary.Contracts;

public class ExamCreatedEvent
{
    public Guid ExamId { get; init; }
    public string ExamCode { get; init; } = string.Empty;
    public List<string> ForbiddenKeywords { get; init; } = new();
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}
