using ExamService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ExamService.Infrastructure.Configurations;

public class SubjectConfiguration : IEntityTypeConfiguration<Subject>
{
    public void Configure(EntityTypeBuilder<Subject> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.SubjectName).IsRequired().HasMaxLength(250);
        builder.Property(x => x.SubjectCode).IsRequired().HasMaxLength(100);

        builder.HasIndex(x => x.SubjectCode).IsUnique();

        builder.HasMany(s => s.Exams)
            .WithOne(e => e.Subject)
            .HasForeignKey(e => e.SubjectId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
