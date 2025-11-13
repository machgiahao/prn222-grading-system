using GradingService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;

namespace GradingService.Infrastructure.Configurations;

public class ExamConfiguration : IEntityTypeConfiguration<Exam>
{
    public void Configure(EntityTypeBuilder<Exam> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.ExamCode).IsRequired().HasMaxLength(100);
        builder.HasIndex(e => e.ExamCode).IsUnique();
        builder.Property(e => e.ForbiddenKeywords)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),

                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null),

                    new ValueComparer<List<string>>(
                        (c1, c2) => c1.SequenceEqual(c2),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()));

        builder.HasOne(exam => exam.Rubric)
               .WithOne(rubric => rubric.Exam)
               .HasForeignKey<Rubric>(rubric => rubric.ExamId);

        builder.HasMany(exam => exam.Batches)
               .WithOne(batch => batch.Exam)
               .HasForeignKey(batch => batch.ExamId);
    }
}
