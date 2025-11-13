
using GradingService.Domain.Abstractions;

namespace GradingService.Domain.Entities;

public class RubricItem : Entity<Guid>
{
    public Guid RubricId { get; set; }
    public Rubric Rubric { get; set; }

    public string Criteria { get; set; }
    public double MaxScore { get; set; }

    public ICollection<GradedRubricItem> GradedItems { get; set; }
}
