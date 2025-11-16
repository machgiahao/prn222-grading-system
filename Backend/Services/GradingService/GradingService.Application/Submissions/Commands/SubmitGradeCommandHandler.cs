using GradingService.Application.Dtos;
using GradingService.Domain.Commons;
using GradingService.Domain.Entities;
using GradingService.Domain.Repositories;
using MediatR;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Exceptions;
using SharedLibrary.Common.Repositories;

namespace GradingService.Application.Submissions.Commands;

public sealed record SubmitGradeCommand(
        Guid SubmissionId,
        string? Comment,
        List<GradedItemDto> GradedItems,
        Guid ExaminerId 
    ) : ICommand;

public class SubmitGradeCommandHandler : ICommandHandler<SubmitGradeCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISubmissionRepository _submissionRepo;
    private readonly IRepository<Grade> _gradeRepo;
    private readonly IRepository<GradedRubricItem> _gradedItemRepo;

    public SubmitGradeCommandHandler(IUnitOfWork unitOfWork, ISubmissionRepository submissionRepo)
    {
        _unitOfWork = unitOfWork;
        _submissionRepo = submissionRepo;
        _gradeRepo = _unitOfWork.Repository<Grade>();
        _gradedItemRepo = _unitOfWork.Repository<GradedRubricItem>();
    }

    public async Task<Unit> Handle(SubmitGradeCommand command, CancellationToken cancellationToken)
    {
        var submission = await _submissionRepo.GetByIdAsync(command.SubmissionId, cancellationToken);
        if (submission == null)
        {
            throw new NotFoundException($"Submission with ID {command.SubmissionId} not found.");
        }

        if (submission.ExaminerId != command.ExaminerId)
        {
            throw new ForbiddenAccessException("You are not assigned to grade this submission.");
        }
        if (submission.Status != SubmissionStatus.Assigned)
        {
            throw new BadRequestException($"Submission is not in 'Assigned' status (Current: {submission.Status}).");
        }

        var newGrade = new Grade
        {
            SubmissionId = command.SubmissionId,
            ExaminerId = command.ExaminerId,
            Comment = command.Comment,
            GradedRubricItems = new List<GradedRubricItem>()
        };

        foreach (var itemDto in command.GradedItems)
        {
            var newGradedItem = new GradedRubricItem
            {
                Grade = newGrade,
                RubricItemId = itemDto.RubricItemId,
                Score = itemDto.Score
            };
            newGrade.GradedRubricItems.Add(newGradedItem);
        }

        await _gradeRepo.AddAsync(newGrade, cancellationToken);
        submission.Status = SubmissionStatus.Graded;
        _submissionRepo.Update(submission);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}