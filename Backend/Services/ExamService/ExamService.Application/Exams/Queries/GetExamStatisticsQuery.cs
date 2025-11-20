using ExamService.Application.Dtos;
using ExamService.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Common.CQRS;

namespace ExamService.Application.Exams.Queries
{
    public sealed record GetExamStatisticsQuery() : IQuery<ExamStatisticsDto>;

    public class GetExamStatisticsQueryHandler : IQueryHandler<GetExamStatisticsQuery, ExamStatisticsDto>
    {
        private readonly IExamRepository _examRepository;

        public GetExamStatisticsQueryHandler(IExamRepository examRepository)
        {
            _examRepository = examRepository;
        }

        public async Task<ExamStatisticsDto> Handle(GetExamStatisticsQuery request, CancellationToken cancellationToken)
        {
            var query = _examRepository.GetQueryable();

            var totalExams = await query.CountAsync(cancellationToken);
            var totalSubjects = await query.Select(x => x.SubjectId).Distinct().CountAsync(cancellationToken);

            var examsPerSemester = await query
                .GroupBy(x => x.Semester.SemesterName)
                .Select(g => new { Semester = g.Key, Count = g.Count() })
                .ToDictionaryAsync(k => k.Semester, v => v.Count, cancellationToken);

            return new ExamStatisticsDto
            {
                TotalExams = totalExams,
                TotalSubjectsWithExams = totalSubjects,
                ExamsPerSemester = examsPerSemester
            };
        }
    }
}