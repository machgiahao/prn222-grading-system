using ExamService.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace ExamService.Infrastructure.Configurations;

public class SemesterConfiguration : IEntityTypeConfiguration<Semester>
{
    public void Configure(EntityTypeBuilder<Semester> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.SemesterName).IsRequired().HasMaxLength(100);

        builder.HasIndex(x => x.SemesterName).IsUnique();

        builder.HasMany(s => s.Exams)
            .WithOne(e => e.Semester)
            .HasForeignKey(e => e.SemesterId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
