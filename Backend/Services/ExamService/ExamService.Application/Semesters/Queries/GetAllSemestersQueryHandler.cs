using AutoMapper;
using ExamService.Application.Dtos;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;

namespace ExamService.Application.Semesters.Queries;

public sealed record GetAllSemestersQuery() : IQuery<List<SemesterDto>>;

public class GetAllSemestersQueryHandler : IQueryHandler<GetAllSemestersQuery, List<SemesterDto>>
{
    private readonly ISemesterRepository _semesterRepository;
    private readonly IMapper _mapper;

    public GetAllSemestersQueryHandler(ISemesterRepository semesterRepository, IMapper mapper)
    {
        _semesterRepository = semesterRepository;
        _mapper = mapper;
    }

    public async Task<List<SemesterDto>> Handle(GetAllSemestersQuery request, CancellationToken cancellationToken)
    {
        var semesters = await _semesterRepository.GetAllAsync(cancellationToken);
        return _mapper.Map<List<SemesterDto>>(semesters);
    }
}
