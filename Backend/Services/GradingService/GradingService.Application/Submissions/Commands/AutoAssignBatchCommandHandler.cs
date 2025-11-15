using GradingService.Domain.Commons;
using GradingService.Domain.Entities;
using GradingService.Domain.Repositories;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Exceptions;
using SharedLibrary.Common.Repositories;

namespace GradingService.Application.Submissions.Commands;

public sealed record AutoAssignBatchCommand(
        Guid SubmissionBatchId,
        List<Guid> ExaminerIds
    ) : ICommand<int>;

public class AutoAssignBatchCommandHandler : ICommandHandler<AutoAssignBatchCommand, int>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISubmissionRepository _submissionRepo;
    private readonly IUserRepository _userRepo;

    public AutoAssignBatchCommandHandler(
            IUnitOfWork unitOfWork,
            ISubmissionRepository submissionRepo,
            IUserRepository userRepo) 
    {
        _unitOfWork = unitOfWork;
        _submissionRepo = submissionRepo;
        _userRepo = userRepo;
    }

    public async Task<int> Handle(AutoAssignBatchCommand command, CancellationToken cancellationToken)
    {
        var examiners = await _userRepo.GetUsersFromListAsync(command.ExaminerIds, cancellationToken);
        if (!examiners.Any())
        {
            throw new BadRequestException("No valid examiners found...");
        }

        var submissionsToAssign = await _submissionRepo.GetReadyToGradeSubmissionsAsync(command.SubmissionBatchId, cancellationToken);
        if (!submissionsToAssign.Any())
        {
            return 0;
        }

        int examinerIndex = 0;
        int assignedCount = 0;

        foreach (var submission in submissionsToAssign)
        {
            var currentExaminer = examiners[examinerIndex];

            submission.ExaminerId = currentExaminer.Id;
            submission.Status = SubmissionStatus.Assigned;

            _submissionRepo.Update(submission);

            assignedCount++;
            examinerIndex = (examinerIndex + 1) % examiners.Count;
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return assignedCount;
    }
}
