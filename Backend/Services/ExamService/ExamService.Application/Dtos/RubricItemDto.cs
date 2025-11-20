namespace ExamService.Application.Dtos
{
    public class RubricItemDto
    {
        public Guid Id { get; set; }
        public string Criteria { get; set; }
        public double MaxScore { get; set; }
        public Guid RubricId { get; set; }
    }
}
