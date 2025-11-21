using AutoMapper;
using ExamService.Application.Exceptions;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Events;
using SharedLibrary.Common.Repositories;
using SharedLibrary.Contracts;

namespace ExamService.Application.Exams.Commands
{
    public sealed record UpdateExamCommand(Guid Id, string ExamCode, List<string> ForbiddenKeywords) : ICommand<Guid>;

    public class UpdateExamCommandHandler : ICommandHandler<UpdateExamCommand, Guid>
    {
        private readonly IExamRepository _examRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEventPublisher _eventPublisher;

        public UpdateExamCommandHandler(IExamRepository examRepository, IUnitOfWork unitOfWork, IMapper mapper, IEventPublisher eventPublisher)
        {
            _examRepository = examRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _eventPublisher = eventPublisher;
        }

        public async Task<Guid> Handle(UpdateExamCommand command, CancellationToken cancellationToken)
        {
            var exam = await _examRepository.GetByIdAsync(command.Id, cancellationToken);
            if (exam == null) throw new ExamNotFoundException(command.Id);

            _mapper.Map(command, exam);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var integrationEvent = new ExamUpdatedEvent
            {
                ExamId = exam.Id,
                ExamCode = exam.ExamCode,
                ForbiddenKeywords = exam.ForbiddenKeywords
            };

            await _eventPublisher.PublishAsync(integrationEvent, cancellationToken);

            return exam.Id;
        }
    }
}
