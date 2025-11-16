using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GradingService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddModeratorFieldsToViolation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsVerified",
                table: "Violations",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModeratorComment",
                table: "Violations",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "VerifiedAt",
                table: "Violations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "VerifiedBy",
                table: "Violations",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsVerified",
                table: "Violations");

            migrationBuilder.DropColumn(
                name: "ModeratorComment",
                table: "Violations");

            migrationBuilder.DropColumn(
                name: "VerifiedAt",
                table: "Violations");

            migrationBuilder.DropColumn(
                name: "VerifiedBy",
                table: "Violations");
        }
    }
}
