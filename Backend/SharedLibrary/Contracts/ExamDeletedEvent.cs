namespace SharedLibrary.Contracts;

public record ExamDeletedEvent
{
    public Guid ExamId { get; init; }
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}