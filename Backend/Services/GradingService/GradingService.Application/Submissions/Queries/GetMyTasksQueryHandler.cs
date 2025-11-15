using AutoMapper;
using GradingService.Application.Dtos;
using GradingService.Domain.Repositories;
using SharedLibrary.Common.CQRS;

namespace GradingService.Application.Submissions.Queries;

public sealed record GetMyTasksQuery(Guid ExaminerId) : IQuery<List<SubmissionTaskDto>>;

public class GetMyTasksQueryHandler : IQueryHandler<GetMyTasksQuery, List<SubmissionTaskDto>>
{
    private readonly ISubmissionRepository _submissionRepository;
    private readonly IMapper _mapper;

    public GetMyTasksQueryHandler(ISubmissionRepository submissionRepo, IMapper mapper)
    {
        _submissionRepository = submissionRepo;
        _mapper = mapper;
    }

    public async Task<List<SubmissionTaskDto>> Handle(GetMyTasksQuery query, CancellationToken cancellationToken)
        {
            var submissions = await _submissionRepository.GetAssignedTasksForExaminerAsync(query.ExaminerId, cancellationToken);

            var tasks = _mapper.Map<List<SubmissionTaskDto>>(submissions);

            return tasks;
        }
}
