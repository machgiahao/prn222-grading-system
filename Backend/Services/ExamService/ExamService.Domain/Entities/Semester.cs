using ExamService.Domain.Abstractions;

namespace ExamService.Domain.Entities;

public class Semester : Entity<Guid>
{
    public string SemesterCode { get; set; }
    public string SemesterName { get; set; }
}
