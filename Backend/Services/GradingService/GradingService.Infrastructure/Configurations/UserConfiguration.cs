using GradingService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GradingService.Infrastructure.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Email).IsRequired().HasMaxLength(100);

        builder.HasIndex(x => x.Email).IsUnique();

        builder.HasMany(u => u.SubmissionBatchs)
                .WithOne(b => b.UploadedByManager)
                .HasForeignKey(b => b.UploadedBy)
                .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(u => u.Submissions)
                .WithOne(s => s.Examiner)
                .HasForeignKey(s => s.ExaminerId)
                .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(u => u.Grades)
                .WithOne(g => g.Examiner)
                .HasForeignKey(g => g.ExaminerId)
                .OnDelete(DeleteBehavior.Cascade);
    }
}
