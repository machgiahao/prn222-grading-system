using GradingService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GradingService.Infrastructure.Configurations;

public class RubricConfiguration : IEntityTypeConfiguration<Rubric>
{
    public void Configure(EntityTypeBuilder<Rubric> builder)
    {
        builder.HasKey(x => x.Id);

        // Come from ExamService
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);

        builder.HasMany(r => r.Items)
                .WithOne(i => i.Rubric)
                .HasForeignKey(i => i.RubricId)
                .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(rubric => rubric.Exam)
                .WithOne(exam => exam.Rubric)
                .HasForeignKey<Rubric>(rubric => rubric.ExamId)
                .OnDelete(DeleteBehavior.Cascade);
    }
}
