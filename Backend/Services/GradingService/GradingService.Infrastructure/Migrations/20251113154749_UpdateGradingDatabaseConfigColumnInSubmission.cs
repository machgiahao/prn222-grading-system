using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GradingService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateGradingDatabaseConfigColumnInSubmission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Submissions_Rubrics_RubricId",
                table: "Submissions");

            migrationBuilder.DropIndex(
                name: "IX_Submissions_RubricId",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "RubricId",
                table: "Submissions");

            migrationBuilder.AlterColumn<string>(
                name: "RarFilePath",
                table: "SubmissionBatches",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000);

            migrationBuilder.AddColumn<Guid>(
                name: "ExamId",
                table: "SubmissionBatches",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ExamId",
                table: "Rubrics",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "RubricId",
                table: "Exams",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_SubmissionBatches_ExamId",
                table: "SubmissionBatches",
                column: "ExamId");

            migrationBuilder.CreateIndex(
                name: "IX_Rubrics_ExamId",
                table: "Rubrics",
                column: "ExamId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Rubrics_Exams_ExamId",
                table: "Rubrics",
                column: "ExamId",
                principalTable: "Exams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SubmissionBatches_Exams_ExamId",
                table: "SubmissionBatches",
                column: "ExamId",
                principalTable: "Exams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rubrics_Exams_ExamId",
                table: "Rubrics");

            migrationBuilder.DropForeignKey(
                name: "FK_SubmissionBatches_Exams_ExamId",
                table: "SubmissionBatches");

            migrationBuilder.DropIndex(
                name: "IX_SubmissionBatches_ExamId",
                table: "SubmissionBatches");

            migrationBuilder.DropIndex(
                name: "IX_Rubrics_ExamId",
                table: "Rubrics");

            migrationBuilder.DropColumn(
                name: "ExamId",
                table: "SubmissionBatches");

            migrationBuilder.DropColumn(
                name: "ExamId",
                table: "Rubrics");

            migrationBuilder.DropColumn(
                name: "RubricId",
                table: "Exams");

            migrationBuilder.AddColumn<Guid>(
                name: "RubricId",
                table: "Submissions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<string>(
                name: "RarFilePath",
                table: "SubmissionBatches",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_RubricId",
                table: "Submissions",
                column: "RubricId");

            migrationBuilder.AddForeignKey(
                name: "FK_Submissions_Rubrics_RubricId",
                table: "Submissions",
                column: "RubricId",
                principalTable: "Rubrics",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
