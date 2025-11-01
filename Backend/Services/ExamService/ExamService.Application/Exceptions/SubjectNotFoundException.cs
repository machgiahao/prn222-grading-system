using SharedLibrary.Common.Exceptions;

namespace ExamService.Application.Exceptions;

public class SubjectNotFoundException : NotFoundException
{
    public SubjectNotFoundException(string message) : base(message)
    {
    }

    public SubjectNotFoundException(Guid id) : base("Subject", id)
    {
    }
}
