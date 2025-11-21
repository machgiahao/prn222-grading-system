using ExamService.Application.Exceptions;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Events;
using SharedLibrary.Common.Repositories;
using SharedLibrary.Contracts;

namespace ExamService.Application.Exams.Commands
{
    public sealed record DeleteExamCommand(Guid Id) : ICommand<Guid>;

    public class DeleteExamCommandHandler : ICommandHandler<DeleteExamCommand, Guid>
    {
        private readonly IExamRepository _examRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEventPublisher _eventPublisher;

        public DeleteExamCommandHandler(IExamRepository examRepository, IUnitOfWork unitOfWork, IEventPublisher eventPublisher)
        {
            _examRepository = examRepository;
            _unitOfWork = unitOfWork;
            _eventPublisher = eventPublisher;
        }

        public async Task<Guid> Handle(DeleteExamCommand request, CancellationToken cancellationToken)
        {
            var exam = await _examRepository.GetByIdAsync(request.Id, cancellationToken);
            if (exam == null) throw new ExamNotFoundException(request.Id);

            _examRepository.Remove(exam);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            var integrationEvent = new ExamDeletedEvent
            {
                ExamId = request.Id
            };

            await _eventPublisher.PublishAsync(integrationEvent, cancellationToken);

            return request.Id;
        }
    }
}
