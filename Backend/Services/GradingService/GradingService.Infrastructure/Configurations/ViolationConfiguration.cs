using GradingService.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace GradingService.Infrastructure.Configurations;

public class ViolationConfiguration : IEntityTypeConfiguration<Violation>
{
    public void Configure(EntityTypeBuilder<Violation> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.ViolationType).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Details).IsRequired(false);
        builder.Property(x => x.SimilarityScore).IsRequired(false);
    }
}
