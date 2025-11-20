using ExamService.Application.Exceptions;
using ExamService.Domain.Entities;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace ExamService.Application.Rubrics.Commands
{
    public sealed record CreateRubricCommand(Guid ExamId) : ICommand<Guid>;

    public class CreateRubricCommandHandler : ICommandHandler<CreateRubricCommand, Guid>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRubricRepository _rubricRepository; 
        private readonly IExamRepository _examRepository; 

        public CreateRubricCommandHandler( IUnitOfWork unitOfWork, IRubricRepository rubricRepository, IExamRepository examRepository)
        {
            _unitOfWork = unitOfWork;
            _rubricRepository = rubricRepository;
            _examRepository = examRepository;
        }

        public async Task<Guid> Handle(CreateRubricCommand command, CancellationToken cancellationToken)
        {
            var exam = await _examRepository.GetByIdAsync(command.ExamId, cancellationToken);
            if (exam == null)
            {
                throw new ExamNotFoundException(command.ExamId);
            }

            var existingRubric = await _rubricRepository.GetByExamIdAsync(command.ExamId, cancellationToken);

            if (existingRubric != null)
            {
                throw new RubricBadRequestException($"Exam with Id '{command.ExamId}' already has a rubric.");
            }

            var rubric = new Rubric { ExamId = command.ExamId };

            await _unitOfWork.Repository<Rubric>().AddAsync(rubric, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return rubric.Id;
        }
    }
}
