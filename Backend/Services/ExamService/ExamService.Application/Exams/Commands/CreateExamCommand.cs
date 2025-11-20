using AutoMapper;
using ExamService.Domain.Entities;
using ExamService.Domain.Repositories;
using FluentValidation;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace ExamService.Application.Exams.Commands
{
    public sealed record CreateExamCommand(string ExamCode, List<string> ForbiddenKeywords, Guid SubjectId, Guid SemesterId) : ICommand<Guid>;

    public class CreateExamCommandValidator : AbstractValidator<CreateExamCommand>
    {
        public CreateExamCommandValidator()
        {
            RuleFor(x => x.ExamCode).NotEmpty().MaximumLength(100);
            RuleFor(x => x.SubjectId).NotEmpty();
            RuleFor(x => x.SemesterId).NotEmpty();
        }
    }

    public class CreateExamCommandHandler : ICommandHandler<CreateExamCommand, Guid>
    {
        private readonly IExamRepository _examRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CreateExamCommandHandler(IExamRepository examRepository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _examRepository = examRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Guid> Handle(CreateExamCommand command, CancellationToken cancellationToken)
        {
            var existing = await _examRepository.GetByCodeAsync(command.ExamCode, cancellationToken);
            if (existing != null) throw new InvalidOperationException($"Exam code '{command.ExamCode}' already exists.");

            var exam = _mapper.Map<Exam>(command);
            _examRepository.Add(exam);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return exam.Id;
        }
    }
}
