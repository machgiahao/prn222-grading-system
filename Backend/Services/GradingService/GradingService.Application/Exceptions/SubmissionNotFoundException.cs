using SharedLibrary.Common.Exceptions;

namespace GradingService.Application.Exceptions;

public class SubmissionNotFoundException : NotFoundException
{
    public SubmissionNotFoundException(string message) : base(message)
    {
    }

    public SubmissionNotFoundException(Guid id) : base("Submission", id)
    {
    }
}
