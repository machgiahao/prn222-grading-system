using ExamService.Application.Exceptions;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace ExamService.Application.Subjects.Commands;

public sealed record DeleteSubjectCommand(Guid Id) : ICommand<Guid>;

public class DeleteSubjectCommandHandler : ICommandHandler<DeleteSubjectCommand, Guid>
{
    private readonly ISubjectRepository _subjectRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteSubjectCommandHandler(ISubjectRepository subjectRepository, IUnitOfWork unitOfWork)
    {
        _subjectRepository = subjectRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(DeleteSubjectCommand request, CancellationToken cancellationToken)
    {
        var subject = await _subjectRepository.GetByIdAsync(request.Id, cancellationToken);
        if (subject == null)
        {
            throw new SubjectNotFoundException(request.Id);
        }

        _subjectRepository.Remove(subject);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return request.Id;
    }
}