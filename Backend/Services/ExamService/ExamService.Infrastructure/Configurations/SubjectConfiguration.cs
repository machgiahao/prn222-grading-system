using ExamService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ExamService.Infrastructure.Configurations;

public class SubjectConfiguration : IEntityTypeConfiguration<Subject>
{
    public void Configure(EntityTypeBuilder<Subject> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.SubjectCode)
            .IsRequired() 
            .HasMaxLength(50); 

        builder.HasIndex(s => s.SubjectCode).IsUnique();

        builder.Property(s => s.SubjectName)
            .IsRequired();
    }
}
