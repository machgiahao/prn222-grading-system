using AutoMapper;
using AutoMapper.QueryableExtensions;
using ExamService.Application.Dtos;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;

namespace ExamService.Application.Semesters.Queries;

public sealed record GetAllSemestersQuery() : IQuery<IQueryable<SemesterDto>>;

public class GetAllSemestersQueryHandler : IQueryHandler<GetAllSemestersQuery, IQueryable<SemesterDto>>
{
    private readonly ISemesterRepository _semesterRepository;
    private readonly IMapper _mapper;

    public GetAllSemestersQueryHandler(ISemesterRepository semesterRepository, IMapper mapper)
    {
        _semesterRepository = semesterRepository;
        _mapper = mapper;
    }

    public Task<IQueryable<SemesterDto>> Handle(GetAllSemestersQuery query, CancellationToken cancellationToken)
    {
        var queryableSemesters = _semesterRepository.GetQueryable();
        var queryableDto = queryableSemesters.ProjectTo<SemesterDto>(_mapper.ConfigurationProvider);

        return Task.FromResult(queryableDto);
    }
}
