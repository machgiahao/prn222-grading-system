using AutoMapper;
using ExamService.Application.Dtos;
using ExamService.Application.Exceptions;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;

namespace ExamService.Application.Subjects.Queries;

public sealed record GetSubjectByIdQuery(Guid Id) : IQuery<SubjectDto>;

public class GetSubjectByIdQueryHandler : IQueryHandler<GetSubjectByIdQuery, SubjectDto>
{
    private readonly ISubjectRepository _subjectRepository;
    private readonly IMapper _mapper;

    public GetSubjectByIdQueryHandler(ISubjectRepository subjectRepository, IMapper mapper)
    {
        _subjectRepository = subjectRepository;
        _mapper = mapper;
    }

    public async Task<SubjectDto> Handle(GetSubjectByIdQuery query, CancellationToken cancellationToken)
    {
        var subject = await _subjectRepository.GetByIdAsync(query.Id, cancellationToken);

        if (subject == null)
        {
            throw new SubjectNotFoundException(query.Id);
        }

        return _mapper.Map<SubjectDto>(subject);
    }
}