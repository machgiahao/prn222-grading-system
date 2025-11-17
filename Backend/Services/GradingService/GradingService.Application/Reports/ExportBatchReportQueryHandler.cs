using GradingService.Domain.Entities;
using GradingService.Domain.Repositories;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using SharedLibrary.Common.CQRS;
using SharedLibrary.Common.Exceptions;
using System.Drawing;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace GradingService.Application.Reports;

public sealed record ExportBatchReportQuery(Guid BatchId) : IQuery<byte[]>;

public class ExportBatchReportQueryHandler : IQueryHandler<ExportBatchReportQuery, byte[]>
{
    private readonly ISubmissionBatchRepository _submissionBatchRepo;

    public ExportBatchReportQueryHandler(ISubmissionBatchRepository submissionBatchRepo)
    {
        _submissionBatchRepo = submissionBatchRepo;
    }

    public async Task<byte[]> Handle(ExportBatchReportQuery query, CancellationToken cancellationToken)
    {
        // 1. Load data
        var batch = await _submissionBatchRepo.GetBatchForReportAsync(query.BatchId, cancellationToken);
        if (batch == null)
        {
            throw new NotFoundException($"SubmissionBatch {query.BatchId} not found.");
        }

        var rubricItems = batch.Exam.Rubric.Items.OrderBy(i => i.Criteria).ToList();
        var submissions = batch.Submissions.OrderBy(s => s.StudentCode).ToList();

        using var package = new ExcelPackage();
        var worksheet = package.Workbook.Worksheets.Add("GradingReport");

        // 3. Build header structure
        int currentCol = 1;

        // Static columns
        SetupStaticColumns(worksheet, ref currentCol);

        // Dynamic rubric columns
        var rubricColumnMap = SetupRubricColumns(worksheet, rubricItems, ref currentCol);

        // Total and Comment columns
        int totalCol = currentCol++;
        int commentCol = currentCol++;
        int truongHopCol = currentCol++;

        SetupSummaryColumns(worksheet, totalCol, commentCol, truongHopCol);

        // 4. Fill data
        int currentRow = 4; // Start from row 4 (after headers)

        foreach (var submission in submissions)
        {
            FillSubmissionRow(
                worksheet,
                submission,
                currentRow,
                rubricColumnMap,
                totalCol,
                commentCol,
                truongHopCol,
                submissions.IndexOf(submission) + 1);

            currentRow++;
        }

        // 5. Auto-fit columns
        worksheet.Cells.AutoFitColumns();

        // 6. Apply borders
        ApplyBorders(worksheet, 1, 1, currentRow - 1, truongHopCol);

        return await package.GetAsByteArrayAsync(cancellationToken);
    }

    private void SetupStaticColumns(ExcelWorksheet worksheet, ref int currentCol)
    {
        // Row 1: Merge for group headers if needed
        // Row 2: Merge for sub-headers
        // Row 3: Individual column headers

        // Column A: No
        worksheet.Cells[1, currentCol, 3, currentCol].Merge = true;
        worksheet.Cells[1, currentCol].Value = "No";
        StyleHeader(worksheet.Cells[1, currentCol, 3, currentCol]);
        currentCol++;

        // Column B: Roll (Student Code)
        worksheet.Cells[1, currentCol, 3, currentCol].Merge = true;
        worksheet.Cells[1, currentCol].Value = "Roll";
        StyleHeader(worksheet.Cells[1, currentCol, 3, currentCol]);
        currentCol++;

        // Column C: Solution (File name)
        worksheet.Cells[1, currentCol, 3, currentCol].Merge = true;
        worksheet.Cells[1, currentCol].Value = "Solution";
        StyleHeader(worksheet.Cells[1, currentCol, 3, currentCol]);
        currentCol++;

        // Column D: Marker (Examiner)
        worksheet.Cells[1, currentCol, 3, currentCol].Merge = true;
        worksheet.Cells[1, currentCol].Value = "Marker";
        StyleHeader(worksheet.Cells[1, currentCol, 3, currentCol]);
        currentCol++;
    }

    private Dictionary<Guid, int> SetupRubricColumns(
        ExcelWorksheet worksheet,
        List<GradingService.Domain.Entities.RubricItem> rubricItems,
        ref int currentCol)
    {
        var rubricColumnMap = new Dictionary<Guid, int>();

        foreach (var item in rubricItems)
        {
            // Row 1: Criteria name (can be grouped)
            worksheet.Cells[1, currentCol].Value = item.Criteria;
            worksheet.Cells[1, currentCol, 2, currentCol].Merge = true;
            StyleHeader(worksheet.Cells[1, currentCol, 2, currentCol]);

            // Row 3: Max score
            worksheet.Cells[3, currentCol].Value = item.MaxScore;
            StyleHeader(worksheet.Cells[3, currentCol]);

            rubricColumnMap[item.Id] = currentCol;
            currentCol++;
        }

        return rubricColumnMap;
    }

    private void SetupSummaryColumns(ExcelWorksheet worksheet, int totalCol, int commentCol, int specialCase)
    {
        // Total column
        worksheet.Cells[1, totalCol, 3, totalCol].Merge = true;
        worksheet.Cells[1, totalCol].Value = "Total";
        StyleHeader(worksheet.Cells[1, totalCol, 3, totalCol], Color.Yellow);

        // Comment column
        worksheet.Cells[1, commentCol, 3, commentCol].Merge = true;
        worksheet.Cells[1, commentCol].Value = "Comment";
        StyleHeader(worksheet.Cells[1, commentCol, 3, commentCol]);

        // Special case handling
        worksheet.Cells[1, specialCase, 2, specialCase].Merge = true;
        worksheet.Cells[1, specialCase].Value = "Trường hợp 0 điểm, bắt buộc ghi chú lý do 0";
        StyleHeader(worksheet.Cells[1, specialCase, 3, specialCase], Color.LightYellow);
        worksheet.Cells[3, specialCase].Value = "→";
    }

    private void FillSubmissionRow(
        ExcelWorksheet worksheet,
        GradingService.Domain.Entities.Submission submission,
        int row,
        Dictionary<Guid, int> rubricColumnMap,
        int totalCol,
        int commentCol,
        int truongHopCol,
        int orderNumber)
    {
        int col = 1;

        // No
        worksheet.Cells[row, col++].Value = orderNumber;

        // Roll (Student Code)
        worksheet.Cells[row, col++].Value = submission.StudentCode;

        // Solution (File name)
        worksheet.Cells[row, col++].Value = submission.FolderName ?? submission.OriginalFileName;

        // Marker (Examiner name)
        var markerName = submission.Examiner?.Name ?? "Not Assigned";
        worksheet.Cells[row, col++].Value = markerName;

        // Get the grade (assume first grade, or latest)
        var grade = submission.Grades?.OrderByDescending(g => g.CreatedAt).FirstOrDefault();

        double totalScore = 0;

        if (grade != null)
        {
            // Fill rubric scores
            foreach (var gradedItem in grade.GradedRubricItems)
            {
                if (rubricColumnMap.ContainsKey(gradedItem.RubricItemId))
                {
                    int scoreCol = rubricColumnMap[gradedItem.RubricItemId];
                    worksheet.Cells[row, scoreCol].Value = gradedItem.Score;
                    totalScore += gradedItem.Score;
                }
            }

            // Comment
            worksheet.Cells[row, commentCol].Value = grade.Comment;
        }

        // Total score
        worksheet.Cells[row, totalCol].Value = totalScore;
        worksheet.Cells[row, totalCol].Style.Font.Bold = true;

        // Highlight if total is 0
        if (totalScore == 0)
        {
            // Highlight total cell with red background
            worksheet.Cells[row, totalCol].Style.Fill.PatternType = ExcelFillStyle.Solid;
            worksheet.Cells[row, totalCol].Style.Fill.BackgroundColor.SetColor(Color.Red);
            worksheet.Cells[row, totalCol].Style.Font.Color.SetColor(Color.White);

            // ✅ FIX: Fill "Trường hợp 0 điểm" column with reason
            var zeroScoreReason = GetZeroScoreReason(submission, grade);
            worksheet.Cells[row, truongHopCol].Value = zeroScoreReason;

            // Highlight the reason cell
            worksheet.Cells[row, truongHopCol].Style.Fill.PatternType = ExcelFillStyle.Solid;
            worksheet.Cells[row, truongHopCol].Style.Fill.BackgroundColor.SetColor(Color.LightYellow);
            worksheet.Cells[row, truongHopCol].Style.Font.Bold = true;
        }
        else
        {
            // Empty for non-zero scores
            worksheet.Cells[row, truongHopCol].Value = "";
        }
    }

    private string GetZeroScoreReason(
       Submission submission,
       Grade? grade)
    {
        // Check if has violations
        if (submission.Violations != null && submission.Violations.Any())
        {
            var violationTypes = submission.Violations
                .Select(v => v.ViolationType)
                .Distinct()
                .ToList();

            return $"Violations: {string.Join(", ", violationTypes)}";
        }

        // Check if not graded yet
        if (grade == null)
        {
            return "Not graded yet";
        }

        // Check comment for reason
        if (!string.IsNullOrWhiteSpace(grade.Comment))
        {
            return grade.Comment;
        }

        return "No reason specified - MUST ADD COMMENT";
    }

    private void StyleHeader(ExcelRange range, Color? backgroundColor = null)
    {
        range.Style.Font.Bold = true;
        range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        range.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
        range.Style.Fill.PatternType = ExcelFillStyle.Solid;
        range.Style.Fill.BackgroundColor.SetColor(backgroundColor ?? Color.LightBlue);
        range.Style.Border.BorderAround(ExcelBorderStyle.Thin);
        range.Style.WrapText = true;
    }

    private void ApplyBorders(ExcelWorksheet worksheet, int fromRow, int fromCol, int toRow, int toCol)
    {
        var range = worksheet.Cells[fromRow, fromCol, toRow, toCol];
        range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
        range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
        range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
        range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
    }
}
