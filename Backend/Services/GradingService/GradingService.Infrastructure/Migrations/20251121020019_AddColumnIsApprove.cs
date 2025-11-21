using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GradingService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddColumnIsApprove : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                table: "SubmissionBatches",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApprovedBy",
                table: "SubmissionBatches",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "SubmissionBatches",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                table: "SubmissionBatches");

            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                table: "SubmissionBatches");

            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "SubmissionBatches");
        }
    }
}
