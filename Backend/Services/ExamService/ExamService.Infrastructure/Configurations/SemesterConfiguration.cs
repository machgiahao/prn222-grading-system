using ExamService.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace ExamService.Infrastructure.Configurations;

public class SemesterConfiguration : IEntityTypeConfiguration<Semester>
{
    public void Configure(EntityTypeBuilder<Semester> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.SemesterCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(s => s.SemesterCode).IsUnique();

        builder.Property(s => s.SemesterName)
            .IsRequired();
    }
}
