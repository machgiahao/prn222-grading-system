using ExamService.Domain.Abstractions;

namespace ExamService.Domain.Entities;

public class Exam : Entity<Guid>
{
    public string ExamCode { get; set; }
    public List<string> ForbiddenKeywords { get; set; } = new List<string>();

    public Guid SubjectId { get; set; }
    public virtual Subject Subject { get; set; }

    public Guid SemesterId { get; set; }
    public virtual Semester Semester { get; set; }

    public virtual Rubric Rubric { get; set; }
}
