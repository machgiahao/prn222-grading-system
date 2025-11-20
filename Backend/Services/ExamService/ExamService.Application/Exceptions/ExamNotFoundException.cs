using SharedLibrary.Common.Exceptions;

namespace ExamService.Application.Exceptions
{
    public class ExamNotFoundException : NotFoundException
    {
        public ExamNotFoundException(Guid id) : base("Exam", id) { }
    }
}
