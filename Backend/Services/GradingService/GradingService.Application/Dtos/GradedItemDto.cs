namespace GradingService.Application.Dtos;

public class GradedItemDto
{
    public Guid RubricItemId { get; set; }
    public double Score { get; set; }
}