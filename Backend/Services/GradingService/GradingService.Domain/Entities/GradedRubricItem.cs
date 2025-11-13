using GradingService.Domain.Abstractions;

namespace GradingService.Domain.Entities;

public class GradedRubricItem : Entity<Guid>
{
    public Guid GradeId { get; set; }
    public virtual Grade Grade { get; set; }

    public Guid RubricItemId { get; set; } 
    public virtual RubricItem RubricItem { get; set; }

    public double Score { get; set; }
}
