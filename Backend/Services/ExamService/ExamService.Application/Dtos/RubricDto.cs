namespace ExamService.Application.Dtos
{
    public class RubricDto
    {
        public Guid Id { get; set; }
        public Guid ExamId { get; set; }
        public List<RubricItemDto> Items { get; set; }
    }
}
