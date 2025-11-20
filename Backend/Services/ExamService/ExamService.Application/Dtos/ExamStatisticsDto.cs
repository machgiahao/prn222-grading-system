namespace ExamService.Application.Dtos
{
    public class ExamStatisticsDto
    {
        public int TotalExams { get; set; }
        public int TotalSubjectsWithExams { get; set; }
        public Dictionary<string, int> ExamsPerSemester { get; set; }
    }
}
