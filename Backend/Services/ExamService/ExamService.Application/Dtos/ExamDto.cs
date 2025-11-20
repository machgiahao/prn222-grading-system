namespace ExamService.Application.Dtos
{
    public class ExamDto
    {
        public Guid Id { get; set; }
        public string ExamCode { get; set; }
        public List<string> ForbiddenKeywords { get; set; }
        public Guid SubjectId { get; set; }
        public string SubjectName { get; set; }
        public Guid SemesterId { get; set; }
        public string SemesterName { get; set; }
        public RubricDto Rubric { get; set; }
    }
}
