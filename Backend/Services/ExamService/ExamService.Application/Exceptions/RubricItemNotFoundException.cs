using SharedLibrary.Common.Exceptions;

namespace ExamService.Application.Exceptions
{
    public class RubricItemNotFoundException : NotFoundException
    {
        public RubricItemNotFoundException(Guid id) : base("RubricItem", id) { }
    }
}
