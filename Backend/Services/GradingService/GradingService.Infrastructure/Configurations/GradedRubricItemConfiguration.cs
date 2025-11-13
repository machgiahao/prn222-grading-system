using GradingService.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace GradingService.Infrastructure.Configurations;

public class GradedRubricItemConfiguration : IEntityTypeConfiguration<GradedRubricItem>
{
    public void Configure(EntityTypeBuilder<GradedRubricItem> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.Score).IsRequired();
    }
}