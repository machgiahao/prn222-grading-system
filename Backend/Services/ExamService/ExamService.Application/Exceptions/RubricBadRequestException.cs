using SharedLibrary.Common.Exceptions;

namespace ExamService.Application.Exceptions
{
    public class RubricBadRequestException : BadRequestException
    {
        public RubricBadRequestException(string message) : base(message)
        {
        }
    }
}
