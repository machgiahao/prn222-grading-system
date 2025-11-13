using GradingService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GradingService.Infrastructure.Configurations;

public class RubricItemConfiguration : IEntityTypeConfiguration<RubricItem>
{
    public void Configure(EntityTypeBuilder<RubricItem> builder)
    {
        builder.HasKey(x => x.Id);

        // Come from ExamService
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.Criteria).IsRequired().HasMaxLength(500);
        builder.Property(x => x.MaxScore).IsRequired();

        builder.HasMany(ri => ri.GradedItems)
            .WithOne(gi => gi.RubricItem)
            .HasForeignKey(gi => gi.RubricItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
