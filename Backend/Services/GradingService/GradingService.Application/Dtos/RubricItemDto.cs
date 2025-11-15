namespace GradingService.Application.Dtos;

public class RubricItemDto
{
    public Guid Id { get; set; }
    public string Criteria { get; set; }
    public double MaxScore { get; set; }
}