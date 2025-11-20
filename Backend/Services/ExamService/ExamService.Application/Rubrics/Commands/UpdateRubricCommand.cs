using ExamService.Application.Exceptions;
using ExamService.Domain.Entities;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace ExamService.Application.Rubrics.Commands
{
    public sealed record UpdateRubricCommand(Guid Id, Guid ExamId) : ICommand<Guid>;

    public class UpdateRubricCommandHandler : ICommandHandler<UpdateRubricCommand, Guid>
    {
        private readonly IUnitOfWork _unitOfWork;

        public UpdateRubricCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Guid> Handle(UpdateRubricCommand request, CancellationToken cancellationToken)
        {
            var repo = _unitOfWork.Repository<Rubric>();
            var rubric = await repo.GetByIdAsync(request.Id, cancellationToken);
            if (rubric == null) throw new RubricNotFoundException(request.Id);

            rubric.ExamId = request.ExamId;
            repo.Update(rubric);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return rubric.Id;
        }
    }
}
