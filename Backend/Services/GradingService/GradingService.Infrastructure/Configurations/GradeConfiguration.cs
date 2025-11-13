using GradingService.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace GradingService.Infrastructure.Configurations;

public class GradeConfiguration : IEntityTypeConfiguration<Grade>
{
    public void Configure(EntityTypeBuilder<Grade> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.Comment).IsRequired(false);

        builder.Ignore(x => x.TotalScore);

        builder.HasMany(g => g.GradedRubricItems)
            .WithOne(gi => gi.Grade)
            .HasForeignKey(gi => gi.GradeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
