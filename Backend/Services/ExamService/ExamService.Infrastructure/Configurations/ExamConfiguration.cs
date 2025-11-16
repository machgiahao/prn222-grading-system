using ExamService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;

namespace ExamService.Infrastructure.Configurations;

public class ExamConfiguration : IEntityTypeConfiguration<Exam>
{
    public void Configure(EntityTypeBuilder<Exam> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.ExamCode).IsRequired().HasMaxLength(100);
        builder.HasIndex(x => x.ExamCode).IsUnique();

        builder.Property(e => e.ForbiddenKeywords)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),

                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null),

                    new ValueComparer<List<string>>(
                        (c1, c2) => c1.SequenceEqual(c2),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()));

        builder.HasIndex(e => e.SubjectId);

        builder.HasIndex(e => e.SemesterId);

        builder.HasOne(e => e.Rubric)
            .WithOne(r => r.Exam)
            .HasForeignKey<Rubric>(r => r.ExamId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
