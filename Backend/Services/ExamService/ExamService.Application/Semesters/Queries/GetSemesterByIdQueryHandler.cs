using AutoMapper;
using ExamService.Application.Dtos;
using ExamService.Application.Exceptions;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;

namespace ExamService.Application.Semesters.Queries;

public sealed record GetSemesterByIdQuery(Guid Id) : IQuery<SemesterDto>;

public class GetSemesterByIdQueryHandler : IQueryHandler<GetSemesterByIdQuery, SemesterDto>
{
    private readonly ISemesterRepository _semesterRepository;
    private readonly IMapper _mapper;

    public GetSemesterByIdQueryHandler(ISemesterRepository semesterRepository, IMapper mapper)
    {
        _semesterRepository = semesterRepository;
        _mapper = mapper;
    }

    public async Task<SemesterDto> Handle(GetSemesterByIdQuery request, CancellationToken cancellationToken)
    {
        var semester = await _semesterRepository.GetByIdAsync(request.Id, cancellationToken);
        if (semester == null)
        {
            throw new SemesterNotFoundException(request.Id);
        }
        return _mapper.Map<SemesterDto>(semester);
    }
}

