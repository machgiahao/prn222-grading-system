using ExamService.Application.Exceptions;
using ExamService.Domain.Entities;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace ExamService.Application.Rubrics.Commands
{
    public sealed record UpdateRubricCommand(Guid Id, Guid ExamId) : ICommand<Guid>;

    public class UpdateRubricCommandHandler : ICommandHandler<UpdateRubricCommand, Guid>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRubricRepository _rubricRepository;
        private readonly IExamRepository _examRepository;

        public UpdateRubricCommandHandler(IUnitOfWork unitOfWork, IRubricRepository rubricRepository, IExamRepository examRepository)
        {
            _unitOfWork = unitOfWork;
            _rubricRepository = rubricRepository;
            _examRepository = examRepository;
        }

        public async Task<Guid> Handle(UpdateRubricCommand request, CancellationToken cancellationToken)
        {
            var repo = _unitOfWork.Repository<Rubric>();
            var rubric = await repo.GetByIdAsync(request.Id, cancellationToken);

            if (rubric == null)
            {
                throw new RubricNotFoundException(request.Id);
            }

            var exam = await _examRepository.GetByIdAsync(request.ExamId, cancellationToken);
            if (exam == null)
            {
                throw new ExamNotFoundException(request.ExamId);
            }

            var collisionRubric = await _rubricRepository.GetByExamIdAsync(request.ExamId, cancellationToken);

            if (collisionRubric != null && collisionRubric.Id != request.Id)
            {
                throw new RubricBadRequestException($"Exam with Id '{request.ExamId}' is already assigned to another rubric.");
            }

            rubric.ExamId = request.ExamId;

            repo.Update(rubric);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return rubric.Id;
        }
    }
}
