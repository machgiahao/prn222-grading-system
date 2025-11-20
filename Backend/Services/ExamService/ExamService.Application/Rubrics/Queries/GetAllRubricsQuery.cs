using AutoMapper;
using AutoMapper.QueryableExtensions;
using ExamService.Application.Dtos;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;

namespace ExamService.Application.Rubrics.Queries
{
    public sealed record GetAllRubricsQuery() : IQuery<IQueryable<RubricDto>>;

    public class GetAllRubricsQueryHandler : IQueryHandler<GetAllRubricsQuery, IQueryable<RubricDto>>
    {
        private readonly IRubricRepository _rubricRepository;
        private readonly IMapper _mapper;

        public GetAllRubricsQueryHandler(IRubricRepository rubricRepository, IMapper mapper)
        {
            _rubricRepository = rubricRepository;
            _mapper = mapper;
        }

        public Task<IQueryable<RubricDto>> Handle(GetAllRubricsQuery request, CancellationToken cancellationToken)
        {
            var queryableEntities = _rubricRepository.GetQueryable();
            return Task.FromResult(queryableEntities.ProjectTo<RubricDto>(_mapper.ConfigurationProvider));
        }
    }
}
