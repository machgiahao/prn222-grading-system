import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  GitBranch,
  Download,
  UserPlus,
} from "lucide-react";
import { AssignPayload, SubmissionData } from "@/lib/types/manager";
import { assignOne } from "@/services/managerServices";

interface SubmissionsTableProps {
  data: SubmissionData[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (newPage: number) => void;
  isLoading: boolean;
  onAssignSuccess: () => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let colorClass = "";
  const lowerStatus = status.toLowerCase();

  switch (lowerStatus) {
    case "pending":
      colorClass = "bg-blue-400 text-blue-800 border border-blue-500";
      break;
    case "scanning":
      colorClass = "bg-purple-400 text-purple-800 border border-purple-500";
      break;
    case "flagged":
      colorClass = "bg-orange-400 text-orange-800 border border-orange-500";
      break;
    case "readytograde":
      colorClass = "bg-green-400 text-green-800 border border-green-500";
      break;
    case "assigned":
      colorClass = "bg-indigo-400 text-indigo-800 border border-indigo-500";
      break;
    case "graded":
      colorClass = "bg-emerald-400 text-emerald-800 border border-emerald-500";
      break;
    case "completed":
      colorClass = "bg-gray-400 text-gray-800 border border-gray-500";
      break;
    case "verified":
      colorClass = "bg-red-400 text-slate-800 border border-slate-500";
      break;
    default:
      colorClass = "bg-gray-400 text-gray-800 border border-gray-500";
  }

  // Format status text
  const displayStatus = status
    .replace('readytograde', 'Ready to Grade')
    .replace(/([A-Z])/g, ' $1')
    .trim();

  return (
    <span
      className={`px-2 py-1 rounded text-sm font-bold inline-flex items-center ${colorClass}`}
    >
      {displayStatus}
    </span>
  );
};

const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  data,
  totalCount,
  pageSize,
  currentPage,
  onPageChange,
  isLoading,
  onAssignSuccess,
}) => {
  const safeCurrentPage = Math.max(1, currentPage);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex =
    totalCount === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(safeCurrentPage * pageSize, totalCount);
  
  const handleAssign = async (submission: SubmissionData) => {
    try{
        if(!submission.examinerId){
            alert("No examiner assigned to this submission.");
            return;
        }
        const body : AssignPayload = {
            submissionId: submission.id,
            examinerId: submission.examinerId
        }
        const response = await assignOne(body);
        if(response.message){
          alert("Assigned submission to " + submission.examinerName + " successfully.");
          onAssignSuccess();
        }else{
            alert("Failed to assign submission.");
        }
    }catch(err){
      console.error("Error assigning submission:", err);
      alert("Error assigning submission. Please try again.");
    }
  }

  return (
    <div className="border border-gray-700 rounded-lg shadow-lg overflow-hidden bg-gray-900 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/80 z-10 flex items-center justify-center backdrop-blur-sm">
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            <span className="text-sm text-gray-300">
              Loading submissions...
            </span>
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100">Submission List</h3>
      </div>

      <Table>
        <TableHeader className="bg-gray-800 border-b border-gray-700">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[120px] text-gray-300 font-semibold text-sm py-3">
              Student Code
            </TableHead>
            <TableHead className="w-[180px] text-gray-300 font-semibold text-sm py-3">
              Exam Code
            </TableHead>
            <TableHead className="w-[100px] text-gray-300 font-semibold text-sm py-3">
              Examiner
            </TableHead>
            <TableHead className="w-[100px] text-gray-300 font-semibold text-sm py-3">
              Status
            </TableHead>
            <TableHead className="w-[200px] text-gray-300 font-semibold text-sm py-3">
              Batch Id
            </TableHead>
            <TableHead className="w-[200px] text-gray-300 font-semibold text-sm py-3">
              Score
            </TableHead>
            <TableHead className="w-[120px] text-center text-gray-300 font-semibold text-sm py-3">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((submission) => (
              <TableRow
                key={submission.id}
                className="hover:bg-gray-800/50 border-b border-gray-700 transition-colors"
              >
                <TableCell className="font-medium text-gray-100 py-3">
                  {submission.studentCode}
                </TableCell>
                <TableCell
                  className="text-xs text-gray-400 font-mono py-3 truncate"
                  title={submission.examCode}
                >
                  {submission.examCode}
                </TableCell>
                <TableCell className="text-gray-300 py-3 text-sm">
                  {submission.examinerName || (
                    <span className="text-gray-500 italic text-xs">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  <StatusBadge status={submission.status} />
                </TableCell>
                <TableCell
                  className="text-xs text-gray-400 font-mono py-3 truncate"
                  title={submission.submissionBatchId}
                >
                  {submission.submissionBatchId}
                </TableCell>
                <TableCell
                  className="text-xs text-gray-400 font-mono py-3 truncate"
                  title={submission.score !== null ? submission.score.toString() : '0'}
                >
                  {submission.score !== null ? submission.score : '0'}
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex justify-center space-x-1">
                    {submission.gitHubRepositoryUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-gray-400 hover:bg-gray-700 hover:text-gray-100 border border-gray-600"
                        asChild
                      >
                        <a
                          href={submission.gitHubRepositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open GitHub repository"
                        >
                          <GitBranch className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-gray-400 hover:bg-gray-700 hover:text-gray-100 border border-gray-600 cursor-pointer"
                      title="Download submission"
                      onClick={() => {
                        const downloadUrl = `https://download-directory.github.io/?url=${submission.gitHubRepositoryUrl}`;
                        window.open(downloadUrl, "_blank");
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    {submission.status.toLowerCase() === "readytograde" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 border border-amber-500/50 cursor-pointer"
                      title="Assign to examiner"
                      onClick={() => {
                        handleAssign(submission);
                      }}
                    >
                      <UserPlus className="h-3 w-3" />
                    </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center py-8">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <div className="h-12 w-12 bg-gray-800 rounded-full flex items-center justify-center mb-2 border border-gray-700">
                    <span className="text-2xl">📁</span>
                  </div>
                  <p className="text-sm font-medium text-gray-400">
                    No submissions found
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Adjust your filters or upload new submissions
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700 bg-gray-800">
        <div className="text-sm text-gray-400">
          Showing{" "}
          <span className="font-semibold text-gray-200">{startIndex}</span> to{" "}
          <span className="font-semibold text-gray-200">{endIndex}</span> of{" "}
          <span className="font-semibold text-gray-200">{totalCount}</span>{" "}
          submissions
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-sm text-gray-400">
            Page{" "}
            <span className="font-semibold text-gray-200">
              {safeCurrentPage}
            </span>{" "}
            of <span className="font-semibold text-gray-200">{totalPages}</span>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 border-gray-600 hover:bg-gray-700 hover:text-gray-100"
              onClick={() => onPageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 border-gray-600 hover:bg-gray-700 hover:text-gray-100"
              onClick={() => onPageChange(safeCurrentPage + 1)}
              disabled={
                safeCurrentPage === totalPages || totalPages === 0 || isLoading
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionsTable;