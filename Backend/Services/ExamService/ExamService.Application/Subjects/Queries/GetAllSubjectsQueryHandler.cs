using AutoMapper;
using ExamService.Application.Dtos;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;

namespace ExamService.Application.Subjects.Queries;

public sealed record GetAllSubjectsQuery() : IQuery<List<SubjectDto>>;

public class GetAllSubjectsQueryHandler : IQueryHandler<GetAllSubjectsQuery, List<SubjectDto>>
{
    private readonly ISubjectRepository _subjectRepository;
    private readonly IMapper _mapper;

    public GetAllSubjectsQueryHandler(ISubjectRepository subjectRepository, IMapper mapper)
    {
        _subjectRepository = subjectRepository;
        _mapper = mapper;
    }

    public async Task<List<SubjectDto>> Handle(GetAllSubjectsQuery request, CancellationToken cancellationToken)
    {
        var subjects = await _subjectRepository.GetAllAsync(cancellationToken);
        return _mapper.Map<List<SubjectDto>>(subjects);
    }
}