using ExamService.Application.Exceptions;
using ExamService.Domain.Entities;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace ExamService.Application.Rubrics.Commands
{
    public sealed record DeleteRubricItemCommand(Guid RubricId, Guid ItemId) : ICommand<Guid>;

    public class DeleteRubricItemCommandHandler : ICommandHandler<DeleteRubricItemCommand, Guid>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteRubricItemCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Guid> Handle(DeleteRubricItemCommand request, CancellationToken cancellationToken)
        {
            var repo = _unitOfWork.Repository<RubricItem>();

            var item = await repo.GetByIdAsync(request.ItemId, cancellationToken);

            if (item == null || item.RubricId != request.RubricId)
            {
                throw new RubricItemNotFoundException(request.ItemId);
            }

            repo.Delete(item);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return request.ItemId;
        }
    }
}
