using AutoMapper;
using AutoMapper.QueryableExtensions;
using ExamService.Application.Dtos;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;

namespace ExamService.Application.Subjects.Queries;

public sealed record GetAllSubjectsQuery() : IQuery<IQueryable<SubjectDto>>;

public class GetAllSubjectsQueryHandler : IQueryHandler<GetAllSubjectsQuery, IQueryable<SubjectDto>>
{
    private readonly ISubjectRepository _subjectRepository;
    private readonly IMapper _mapper;

    public GetAllSubjectsQueryHandler(ISubjectRepository subjectRepository, IMapper mapper)
    {
        _subjectRepository = subjectRepository;
        _mapper = mapper;
    }

    public Task<IQueryable<SubjectDto>> Handle(GetAllSubjectsQuery query, CancellationToken cancellationToken)
    {
        var queryableSubjects = _subjectRepository.GetQueryable();

        var queryableDto = queryableSubjects
            .ProjectTo<SubjectDto>(_mapper.ConfigurationProvider);

        return Task.FromResult(queryableDto);
    }
}