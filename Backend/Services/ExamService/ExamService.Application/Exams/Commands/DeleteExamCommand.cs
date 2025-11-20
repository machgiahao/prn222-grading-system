using ExamService.Application.Exceptions;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace ExamService.Application.Exams.Commands
{
    public sealed record DeleteExamCommand(Guid Id) : ICommand<Guid>;

    public class DeleteExamCommandHandler : ICommandHandler<DeleteExamCommand, Guid>
    {
        private readonly IExamRepository _examRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteExamCommandHandler(IExamRepository examRepository, IUnitOfWork unitOfWork)
        {
            _examRepository = examRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Guid> Handle(DeleteExamCommand request, CancellationToken cancellationToken)
        {
            var exam = await _examRepository.GetByIdAsync(request.Id, cancellationToken);
            if (exam == null) throw new ExamNotFoundException(request.Id);

            _examRepository.Remove(exam);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return request.Id;
        }
    }
}
