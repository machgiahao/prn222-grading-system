using AutoMapper;
using AutoMapper.QueryableExtensions;
using ExamService.Application.Dtos;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;

namespace ExamService.Application.Exams.Queries
{
    public sealed record GetAllExamsQuery() : IQuery<IQueryable<ExamDto>>;

    public class GetAllExamsQueryHandler : IQueryHandler<GetAllExamsQuery, IQueryable<ExamDto>>
    {
        private readonly IExamRepository _examRepository;
        private readonly IMapper _mapper;

        public GetAllExamsQueryHandler(IExamRepository examRepository, IMapper mapper)
        {
            _examRepository = examRepository;
            _mapper = mapper;
        }

        public Task<IQueryable<ExamDto>> Handle(GetAllExamsQuery query, CancellationToken cancellationToken)
        {
            var queryable = _examRepository.GetQueryable();
            return Task.FromResult(queryable.ProjectTo<ExamDto>(_mapper.ConfigurationProvider));
        }
    }
}
