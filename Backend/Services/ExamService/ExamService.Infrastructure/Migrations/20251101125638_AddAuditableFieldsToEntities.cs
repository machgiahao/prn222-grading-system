using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ExamService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditableFieldsToEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LastTimeModified",
                table: "Subjects",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LastModifiedBy",
                table: "Subjects",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LastTimeModified",
                table: "Semesters",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LastModifiedBy",
                table: "Semesters",
                newName: "UpdatedBy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "Subjects",
                newName: "LastModifiedBy");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Subjects",
                newName: "LastTimeModified");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "Semesters",
                newName: "LastModifiedBy");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Semesters",
                newName: "LastTimeModified");
        }
    }
}
