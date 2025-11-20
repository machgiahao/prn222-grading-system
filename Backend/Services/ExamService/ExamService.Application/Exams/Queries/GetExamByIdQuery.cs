using AutoMapper;
using ExamService.Application.Dtos;
using ExamService.Application.Exceptions;
using ExamService.Domain.Repositories;
using SharedLibrary.Common.CQRS;

namespace ExamService.Application.Exams.Queries
{
    public sealed record GetExamByIdQuery(Guid Id) : IQuery<ExamDto>;

    public class GetExamByIdQueryHandler : IQueryHandler<GetExamByIdQuery, ExamDto>
    {
        private readonly IExamRepository _examRepository;
        private readonly IMapper _mapper;

        public GetExamByIdQueryHandler(IExamRepository examRepository, IMapper mapper)
        {
            _examRepository = examRepository;
            _mapper = mapper;
        }

        public async Task<ExamDto> Handle(GetExamByIdQuery query, CancellationToken cancellationToken)
        {
            var exam = await _examRepository.GetByIdAsync(query.Id, cancellationToken);
            if (exam == null) throw new ExamNotFoundException(query.Id);
            return _mapper.Map<ExamDto>(exam);
        }
    }
}
