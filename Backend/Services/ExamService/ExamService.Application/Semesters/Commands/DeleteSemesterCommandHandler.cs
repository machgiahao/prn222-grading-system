using ExamService.Application.Exceptions;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Repositories;

namespace ExamService.Application.Semesters.Commands;

public sealed record DeleteSemesterCommand(Guid Id) : ICommand<Guid>;

public class DeleteSemesterCommandHandler : ICommandHandler<DeleteSemesterCommand, Guid>
{
    private readonly ISemesterRepository _semesterRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteSemesterCommandHandler(ISemesterRepository semesterRepository, IUnitOfWork unitOfWork)
    {
        _semesterRepository = semesterRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(DeleteSemesterCommand request, CancellationToken cancellationToken)
    {
        var semester = await _semesterRepository.GetByIdAsync(request.Id, cancellationToken);
        if (semester == null)
        {
            throw new SemesterNotFoundException(request.Id);
        }

        _semesterRepository.Remove(semester);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return request.Id;
    }
}