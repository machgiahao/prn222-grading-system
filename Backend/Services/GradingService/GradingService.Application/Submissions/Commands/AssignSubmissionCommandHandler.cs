using GradingService.Application.Exceptions;
using GradingService.Domain.Commons;
using GradingService.Domain.Entities;
using GradingService.Domain.Repositories;
using MediatR;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Exceptions;
using SharedLibrary.Common.Repositories;

namespace GradingService.Application.Submissions.Commands;

public sealed record AssignSubmissionCommand(Guid SubmissionId, Guid ExaminerId) : ICommand;

public class AssignSubmissionCommandHandler : ICommandHandler<AssignSubmissionCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISubmissionRepository _submissionRepo;
    private readonly IUserRepository _userRepo;

    public AssignSubmissionCommandHandler(
        IUnitOfWork unitOfWork,
        ISubmissionRepository submissionRepo,
        IUserRepository userRepo)
    {
        _unitOfWork = unitOfWork;
        _submissionRepo = submissionRepo;
        _userRepo = userRepo;
    }

    public async Task<Unit> Handle(AssignSubmissionCommand command, CancellationToken cancellationToken)
    {
        var submission = await _submissionRepo.GetByIdAsync(command.SubmissionId, cancellationToken);
        if (submission == null)
        {
            throw new SubmissionNotFoundException($"Submission with ID {command.SubmissionId} not found.");
        }

        var examiner = await _userRepo.GetByIdAsync(command.ExaminerId, cancellationToken);
        if (examiner == null)
        {
            throw new NotFoundException($"Examiner (User) with Id '{command.ExaminerId}' not found.");
        }

        if (submission.Status == SubmissionStatus.Flagged)
        {
            throw new BadRequestException("This submission is flagged and must be handled by a Moderator, not an Examiner.");
        }

        if (submission.Status != SubmissionStatus.ReadyToGrade && submission.Status != SubmissionStatus.Assigned)
        {
            throw new BadRequestException($"Submission is not in a state to be assigned (Status: {submission.Status}).");
        }

        submission.ExaminerId = command.ExaminerId;
        submission.Status = SubmissionStatus.Assigned;

        _submissionRepo.Update(submission);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
