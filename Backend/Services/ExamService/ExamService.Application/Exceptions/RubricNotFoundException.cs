using SharedLibrary.Common.Exceptions;

namespace ExamService.Application.Exceptions
{
    public class RubricNotFoundException : NotFoundException
    {
        public RubricNotFoundException(Guid id) : base("Rubric", id) { }
    }
}
