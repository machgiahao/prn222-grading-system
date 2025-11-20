using AutoMapper;
using ExamService.Application.Exceptions;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace ExamService.Application.Exams.Commands
{
    public sealed record UpdateExamCommand(Guid Id, string ExamCode, List<string> ForbiddenKeywords) : ICommand<Guid>;

    public class UpdateExamCommandHandler : ICommandHandler<UpdateExamCommand, Guid>
    {
        private readonly IExamRepository _examRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UpdateExamCommandHandler(IExamRepository examRepository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _examRepository = examRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Guid> Handle(UpdateExamCommand command, CancellationToken cancellationToken)
        {
            var exam = await _examRepository.GetByIdAsync(command.Id, cancellationToken);
            if (exam == null) throw new ExamNotFoundException(command.Id);

            _mapper.Map(command, exam);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return exam.Id;
        }
    }
}
