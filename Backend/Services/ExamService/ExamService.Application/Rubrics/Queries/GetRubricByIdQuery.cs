using AutoMapper;
using ExamService.Application.Dtos;
using ExamService.Application.Exceptions;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;

namespace ExamService.Application.Rubrics.Queries
{
    public sealed record GetRubricByIdQuery(Guid Id) : IQuery<RubricDto>;

    public class GetRubricByIdQueryHandler : IQueryHandler<GetRubricByIdQuery, RubricDto>
    {
        private readonly IRubricRepository _rubricRepository;
        private readonly IMapper _mapper;

        public GetRubricByIdQueryHandler(IRubricRepository rubricRepository, IMapper mapper)
        {
            _rubricRepository = rubricRepository;
            _mapper = mapper;
        }

        public async Task<RubricDto> Handle(GetRubricByIdQuery request, CancellationToken cancellationToken)
        {
            var rubric = await _rubricRepository.GetByIdWithItemsAsync(request.Id, cancellationToken);
            if (rubric == null) throw new RubricNotFoundException(request.Id);
            return _mapper.Map<RubricDto>(rubric);
        }
    }
}
