using AutoMapper;
using GradingService.Application.Dtos;
using GradingService.Application.Exceptions;
using GradingService.Domain.Repositories;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Exceptions;

namespace GradingService.Application.Submissions.Queries;

public sealed record GetGradingDetailsQuery(Guid SubmissionId) : IQuery<GradingDetailsDto>;

public class GetGradingDetailsQueryHandler : IQueryHandler<GetGradingDetailsQuery, GradingDetailsDto>
{
    private readonly ISubmissionRepository _submissionRepo;
    private readonly IMapper _mapper;

    public GetGradingDetailsQueryHandler(ISubmissionRepository submissionRepo, IMapper mapper)
    {
        _submissionRepo = submissionRepo;
        _mapper = mapper;
    }

    public async Task<GradingDetailsDto> Handle(GetGradingDetailsQuery query, CancellationToken cancellationToken)
    {
        var submission = await _submissionRepo.GetSubmissionWithGradingDetailsAsync(query.SubmissionId, cancellationToken);

        if (submission == null)
        {
            throw new SubmissionNotFoundException($"Submission with ID {query.SubmissionId} not found.");
        }

        if (submission.Batch?.Exam?.Rubric?.Items == null)
        {
            throw new NotFoundException($"Could not find Rubric items associated with this submission.");
        }

        var detailsDto = _mapper.Map<GradingDetailsDto>(submission);

        return detailsDto;
    }
}
