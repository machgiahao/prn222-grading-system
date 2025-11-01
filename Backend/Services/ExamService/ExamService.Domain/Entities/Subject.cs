using ExamService.Domain.Abstractions;

namespace ExamService.Domain.Entities;

public class Subject : Entity<Guid>
{
    public string SubjectCode { get; set; }
    public string SubjectName { get; set; }
}
