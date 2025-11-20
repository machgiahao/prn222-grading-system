using ExamService.Domain.Entities;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace ExamService.Application.Rubrics.Commands
{
    public sealed record CreateRubricCommand(Guid ExamId) : ICommand<Guid>;

    public class CreateRubricCommandHandler : ICommandHandler<CreateRubricCommand, Guid>
    {
        private readonly IRubricRepository _rubricRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CreateRubricCommandHandler(IRubricRepository rubricRepository, IUnitOfWork unitOfWork)
        {
            _rubricRepository = rubricRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Guid> Handle(CreateRubricCommand command, CancellationToken cancellationToken)
        {
            var existing = await _rubricRepository.GetByExamIdAsync(command.ExamId, cancellationToken);
            if (existing != null) throw new InvalidOperationException("Exam already has a rubric.");

            var rubric = new Rubric { ExamId = command.ExamId };

            await _unitOfWork.Repository<Rubric>().AddAsync(rubric, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return rubric.Id;
        }
    }
}
