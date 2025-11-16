using GradingService.Domain.Commons;
using GradingService.Domain.Repositories;
using MediatR;
using Microsoft.AspNetCore.Http;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Exceptions;
using SharedLibrary.Common.Repositories;
using System.Security.Claims;

namespace GradingService.Application.Submissions.Commands;

public sealed record VerifyViolationCommand(
    Guid SubmissionId,
    bool IsViolationConfirmed,
    string? ModeratorComment,
    Guid ModeratorId
) : ICommand;


public class VerifyViolationCommandHandler : ICommandHandler<VerifyViolationCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISubmissionRepository _submissionRepository;

    public VerifyViolationCommandHandler(
        IUnitOfWork unitOfWork,
        ISubmissionRepository submissionRepository)
    {
        _unitOfWork = unitOfWork;
        _submissionRepository = submissionRepository;
    }

    public async Task<Unit> Handle(VerifyViolationCommand command, CancellationToken cancellationToken)
    {
        Guid moderatorId = command.ModeratorId;


        var submission = await _submissionRepository.GetByIdWithViolationsAsync(
            command.SubmissionId,
            cancellationToken);

        if (submission == null)
        {
            throw new NotFoundException($"Submission with ID {command.SubmissionId} not found.");
        }

        // Validate submission status
        if (submission.Status != SubmissionStatus.Flagged)
        {
            throw new BadRequestException(
                $"Only flagged submissions can be verified. Current status: {submission.Status}");
        }

        // Check if submission has violations
        if (submission.Violations == null || !submission.Violations.Any())
        {
            throw new BadRequestException(
                $"Submission {command.SubmissionId} has no violations to verify.");
        }
        var now = DateTime.UtcNow;

        if (command.IsViolationConfirmed)
        {
            // Confirm violation - submission remains with 0 points
            submission.Status = SubmissionStatus.Verified;

            // Update all violations with moderator verification
            foreach (var violation in submission.Violations)
            {
                violation.IsVerified = true;
                violation.ModeratorComment = command.ModeratorComment;
                violation.VerifiedBy = moderatorId;
                violation.VerifiedAt = now;
            }
        }
        else
        {
            // Violation rejected - clear violations and make ready for grading
            submission.Status = SubmissionStatus.ReadyToGrade;

            // Mark violations as rejected (not confirmed)
            foreach (var violation in submission.Violations)
            {
                violation.IsVerified = false;
                violation.ModeratorComment = command.ModeratorComment;
                violation.VerifiedBy = moderatorId;
                violation.VerifiedAt = now;
            }
        }

        _submissionRepository.Update(submission);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
