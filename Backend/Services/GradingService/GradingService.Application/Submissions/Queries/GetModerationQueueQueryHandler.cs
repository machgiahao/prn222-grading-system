using AutoMapper;
using GradingService.Application.Dtos;
using GradingService.Domain.Repositories;
using SharedLibrary.Common.CQRS;

namespace GradingService.Application.Submissions.Queries;

public sealed record GetModerationQueueQuery() : IQuery<List<ModerationTaskDto>>;

public class GetModerationQueueQueryHandler : IQueryHandler<GetModerationQueueQuery, List<ModerationTaskDto>>
{
    private readonly ISubmissionRepository _submissionRepo;
    private readonly IMapper _mapper;

    public GetModerationQueueQueryHandler(ISubmissionRepository submissionRepo, IMapper mapper)
    {
        _submissionRepo = submissionRepo;
        _mapper = mapper;
    }

    public async Task<List<ModerationTaskDto>> Handle(GetModerationQueueQuery query, CancellationToken cancellationToken)
    {
        var submissions = await _submissionRepo.GetModerationQueueAsync(cancellationToken);

        var tasks = _mapper.Map<List<ModerationTaskDto>>(submissions);

        return tasks;
    }
}
