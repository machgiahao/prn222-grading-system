using GradingService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GradingService.Infrastructure.Configurations;

public class SubmissionConfiguration : IEntityTypeConfiguration<Submission>
{
    public void Configure(EntityTypeBuilder<Submission> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.StudentCode).IsRequired().HasMaxLength(50);
        builder.Property(x => x.OriginalFileName).IsRequired().HasMaxLength(255);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(50);

        builder.Property(x => x.ExaminerId).IsRequired(false);

        builder.HasMany(s => s.Violations)
                .WithOne(v => v.Submission)
                .HasForeignKey(v => v.SubmissionId)
                .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Grades)
            .WithOne(g => g.Submission)
            .HasForeignKey(g => g.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
