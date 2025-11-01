using SharedLibrary.Common.Exceptions;

namespace ExamService.Application.Exceptions;

public class SubjectBadRequestException : BadRequestException
{
    public SubjectBadRequestException(string message) : base(message)
    {
    }
}
