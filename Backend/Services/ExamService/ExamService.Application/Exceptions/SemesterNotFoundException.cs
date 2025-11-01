using SharedLibrary.Common.Exceptions;

namespace ExamService.Application.Exceptions;

public class SemesterNotFoundException : NotFoundException
{
    public SemesterNotFoundException(string message) : base(message)
    {
    }

    public SemesterNotFoundException(Guid id) : base("Semester", id)
    {
    }
}
