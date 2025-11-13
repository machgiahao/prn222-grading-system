using GradingService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GradingService.Infrastructure.Configurations;

public class SubmissionBatchConfiguration : IEntityTypeConfiguration<SubmissionBatch>
{
    public void Configure(EntityTypeBuilder<SubmissionBatch> builder)
    {
        builder.HasKey(b => b.Id);
        builder.Property(b => b.RarFilePath).IsRequired();
        builder.Property(b => b.Status).IsRequired().HasMaxLength(50);

        builder.HasOne(batch => batch.Exam)
               .WithMany(exam => exam.Batches)
               .HasForeignKey(batch => batch.ExamId)
               .OnDelete(DeleteBehavior.Restrict); 

        builder.HasOne(batch => batch.UploadedByManager)
               .WithMany(user => user.SubmissionBatchs)
               .HasForeignKey(batch => batch.UploadedBy);

        builder.HasMany(batch => batch.Submissions)
               .WithOne(submission => submission.Batch)
               .HasForeignKey(submission => submission.SubmissionBatchId);
    }
}
