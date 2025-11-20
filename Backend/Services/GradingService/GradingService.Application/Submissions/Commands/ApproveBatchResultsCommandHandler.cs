using GradingService.Domain.Commons;
using GradingService.Domain.Repositories;
using MediatR;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Exceptions;
using SharedLibrary.Common.Repositories;

namespace GradingService.Application.Submissions.Commands;

public sealed record ApproveBatchResultsCommand(
    Guid BatchId,
    Guid AdminId
) : ICommand;

public class ApproveBatchResultsCommandHandler : ICommandHandler<ApproveBatchResultsCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISubmissionBatchRepository _submissionBatchRepo;

    public ApproveBatchResultsCommandHandler(
        IUnitOfWork unitOfWork,
        ISubmissionBatchRepository submissionBatchRepo)
    {
        _unitOfWork = unitOfWork;
        _submissionBatchRepo = submissionBatchRepo;
    }

    public async Task<Unit> Handle(ApproveBatchResultsCommand command, CancellationToken cancellationToken)
    {
        // 1. Load batch with submissions and violations
        var batch = await _submissionBatchRepo.GetBatchForApprovalAsync(
            command.BatchId,
            cancellationToken);

        if (batch == null)
        {
            throw new NotFoundException($"SubmissionBatch with ID {command.BatchId} not found.");
        }

        // 2. Validate: All submissions must be graded or verified
        var pendingSubmissions = batch.Submissions
            .Where(s => s.Status != SubmissionStatus.Graded
                     && s.Status != SubmissionStatus.Verified
                     && s.Status != SubmissionStatus.Completed)
            .ToList();

        if (pendingSubmissions.Any())
        {
            throw new BadRequestException(
                $"Cannot approve batch: {pendingSubmissions.Count} submissions are not yet graded or verified. " +
                $"Pending submission IDs: {string.Join(", ", pendingSubmissions.Select(s => s.Id))}");
        }

        // 3. Validate: All zero-score submissions must be verified by Moderator
        var unverifiedZeroScores = batch.Submissions
            .Where(s => HasZeroScore(s) && !IsVerifiedByModerator(s))
            .ToList();

        if (unverifiedZeroScores.Any())
        {
            throw new BadRequestException(
                $"Cannot approve batch: {unverifiedZeroScores.Count} submissions with zero scores " +
                $"have not been verified by a Moderator. " +
                $"Unverified submission IDs: {string.Join(", ", unverifiedZeroScores.Select(s => s.Id))}");
        }

        // 4. Mark all graded submissions as "Completed"
        foreach (var submission in batch.Submissions.Where(s => s.Status == SubmissionStatus.Graded))
        {
            submission.Status = SubmissionStatus.Completed;
        }

        // 5. Mark batch as approved
        batch.IsApproved = true;
        batch.ApprovedBy = command.AdminId;
        batch.ApprovedAt = DateTime.UtcNow;

        _submissionBatchRepo.Update(batch);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }

    private bool HasZeroScore(Domain.Entities.Submission submission)
    {
        var latestGrade = submission.Grades?
            .OrderByDescending(g => g.CreatedAt)
            .FirstOrDefault();

        if (latestGrade == null)
            return false;

        var totalScore = latestGrade.GradedRubricItems?.Sum(item => item.Score) ?? 0;
        return totalScore == 0;
    }

    private bool IsVerifiedByModerator(Domain.Entities.Submission submission)
    {
        // If submission status is Verified, it means Moderator confirmed the violation
        if (submission.Status == SubmissionStatus.Verified)
            return true;

        // Or check if violations were verified
        if (submission.Violations != null && submission.Violations.Any())
        {
            return submission.Violations.All(v => v.IsVerified.HasValue && v.VerifiedBy.HasValue);
        }

        // If no violations and status is not Verified, might be manually graded to 0
        // Check if grade has a comment explaining the zero
        var latestGrade = submission.Grades?
            .OrderByDescending(g => g.CreatedAt)
            .FirstOrDefault();

        return latestGrade != null && !string.IsNullOrWhiteSpace(latestGrade.Comment);
    }
}