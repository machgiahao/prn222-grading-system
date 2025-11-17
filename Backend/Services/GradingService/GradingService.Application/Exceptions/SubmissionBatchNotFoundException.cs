using SharedLibrary.Common.Exceptions;

namespace GradingService.Application.Exceptions;

public class SubmissionBatchNotFoundException : NotFoundException
{
    public SubmissionBatchNotFoundException(string message) : base(message)
    {
    }

    public SubmissionBatchNotFoundException(Guid id) : base("SubmissionBatch", id)
    {
    }
}