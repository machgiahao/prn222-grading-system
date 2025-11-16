using ExamService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ExamService.Infrastructure.Configurations;

public class RubricConfiguration : IEntityTypeConfiguration<Rubric>
{
    public void Configure(EntityTypeBuilder<Rubric> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.HasIndex(r => r.ExamId).IsUnique();

        builder.HasMany(r => r.Items)
            .WithOne(i => i.Rubric)
            .HasForeignKey(i => i.RubricId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
