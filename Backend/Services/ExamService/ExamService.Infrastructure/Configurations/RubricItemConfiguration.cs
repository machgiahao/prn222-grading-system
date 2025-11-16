using ExamService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ExamService.Infrastructure.Configurations;

public class RubricItemConfiguration : IEntityTypeConfiguration<RubricItem>
{
    public void Configure(EntityTypeBuilder<RubricItem> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.Criteria).IsRequired().HasMaxLength(500);
        builder.Property(x => x.MaxScore).IsRequired();

        builder.HasIndex(i => i.RubricId);
    }
}
