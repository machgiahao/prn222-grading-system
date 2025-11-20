using ExamService.Application.Exceptions;
using ExamService.Domain.Entities;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace ExamService.Application.Rubrics.Commands
{
    public sealed record DeleteRubricCommand(Guid Id) : ICommand<Guid>;

    public class DeleteRubricCommandHandler : ICommandHandler<DeleteRubricCommand, Guid>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteRubricCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Guid> Handle(DeleteRubricCommand request, CancellationToken cancellationToken)
        {
            var repo = _unitOfWork.Repository<Rubric>();
            var rubric = await repo.GetByIdAsync(request.Id, cancellationToken);
            if (rubric == null) throw new RubricNotFoundException(request.Id);

            repo.Delete(rubric);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return request.Id;
        }
    }
}
