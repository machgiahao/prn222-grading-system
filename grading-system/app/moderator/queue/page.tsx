"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Award, Eye, Flag, LogOut, X } from "lucide-react";
import {
  ModerationQueueItem,
  VerifyViolationPayload,
} from "@/lib/types/moderator";
import {
  getModerationQueue,
  verifyViolation,
} from "@/services/moderatorServices";
import { useAuth } from "@/context/auth-context";

export default function ModerationQueuePage() {
  const [queueList, setQueueList] = useState<ModerationQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [isViolationConfirmed, setIsViolationConfirmed] = useState(false);
  const [moderatorComment, setModeratorComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState<"studentCode" | "batchName">(
    "studentCode"
  );
  const [verificationProgress, setVerificationProgress] = useState<string[]>(
    []
  );

  const fetchModerationQueue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getModerationQueue();
      setQueueList(data);
    } catch (err: any) {
      console.error("Failed to fetch moderation queue:", err);
      setError("Unable to load the flagged submission list. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationQueue();
  }, []);

  const handleCloseModal = () => {
    setOpenModal(null);
    setIsViolationConfirmed(false);
    setModeratorComment("");
    setCurrentCardIndex(0);
    setVerificationProgress([]);
  };

  const handleSubmitVerification = async () => {
    const itemsToVerify =
      openModal && openModal !== "bulk" ? [openModal] : selectedItems;
    if (itemsToVerify.length === 0) return;

    const studentCodes = itemsToVerify
      .map((id) => queueList.find((item) => item.id === id)?.studentCode)
      .filter(Boolean)
      .join(", ");

    const confirmMessage =
      itemsToVerify.length === 1
        ? `Are you sure you want to verify this violation for ${studentCodes}?`
        : `Are you sure you want to verify violations for ${studentCodes}?`;

    if (!confirm(confirmMessage)) return;

    setIsSubmitting(true);
    setVerificationProgress([]);

    try {
      const results = await Promise.all(
        itemsToVerify.map(async (submissionId) => {
          const payload: VerifyViolationPayload = {
            submissionId,
            isViolationConfirmed: isViolationConfirmed,
            moderatorComment: moderatorComment.trim(),
          };

          try {
            console.log("Submitting verification for:", payload);
            const response = await verifyViolation(payload);
            const studentCode =
              queueList.find((item) => item.id === submissionId)?.studentCode ||
              submissionId;
            setVerificationProgress((prev) => [
              ...prev,
              `✓ Verified ${studentCode}`,
            ]);
            return { success: true, submissionId };
          } catch (error) {
            const studentCode =
              queueList.find((item) => item.id === submissionId)?.studentCode ||
              submissionId;
            setVerificationProgress((prev) => [
              ...prev,
              `✗ Failed ${studentCode}`,
            ]);
            return { success: false, submissionId };
          }
        })
      );

      const successCount = results.filter((r) => r.success).length;
      alert(
        `Verification complete! ${successCount}/${itemsToVerify.length} submissions verified successfully.`
      );

      handleCloseModal();
      setSelectedItems([]);
      setBulkMode(false);
      await fetchModerationQueue();
    } catch (err: any) {
      console.error("Failed to verify violations:", err);
      alert("Failed to submit verifications. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedItem =
    openModal && openModal !== "bulk"
      ? queueList.find((item) => item.id === openModal)
      : null;

  const selectedItemsData = selectedItems
    .map((id) => queueList.find((item) => item.id === id))
    .filter(Boolean) as ModerationQueueItem[];

  const currentItem = selectedItemsData[currentCardIndex];

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading flagged submission list...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-destructive">
        <p>Error: {error}</p>
      </div>
    );
  }

  const handleUrlGithubFile = (detail: string, linkgit: string) => {
    const filePath = detail.match(/\(in file: (.+?)\)/)?.[1];
    if (filePath) {
      const githubUrl = "/" + filePath;
      return linkgit + githubUrl;
    }
    return "None";
  };

  const handleLogout = () => () => {
    logout();
    window.location.href = "/";
  };

  const totalQueue = queueList.length;
  const totalViolations = queueList.reduce(
    (sum, item) => sum + item.violationCount,
    0
  );

  const filteredQueueList = queueList
    .filter((item) => {
      if (!searchTerm.trim()) return true; 

      const searchLower = searchTerm.trim().toLowerCase();
      const targetValue =
        searchBy === "studentCode" ? item.studentCode : item.batchName;

      return targetValue.toLowerCase().includes(searchLower);
    });


  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-xl font-bold text-white">Grading System</h1>
                <p className="text-sm text-gray-400">Moderator Portal</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="gap-2 bg-transparent border-zinc-700 text-white hover:bg-red-600 hover:border-red-600 !text-white cursor-pointer transition-colors"
              onClick={handleLogout()}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Moderation Queue
              </h2>
              <p className="text-muted-foreground">
                Review and verify flagged submissions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="rounded-lg bg-card border border-border p-6">
                <p className="text-muted-foreground text-sm mb-2">
                  Pending Review
                </p>
                <p className="text-4xl font-bold text-destructive">
                  {totalQueue}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Submissions
                </p>
              </div>

              <div className="rounded-lg bg-card border border-border p-6">
                <p className="text-muted-foreground text-sm mb-2">
                  Total Violations
                </p>
                <p className="text-4xl font-bold text-orange-500">
                  {totalViolations}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Detected issues
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Flag className="h-5 w-5 text-destructive" />
                  Flagged Submissions ({totalQueue} items)
                </h3>
                <Button
                  onClick={() => {
                    setBulkMode(!bulkMode);
                    setSelectedItems([]);
                  }}
                  className={`gap-2 cursor-pointer ${
                    bulkMode
                      ? "bg-zinc-700 hover:bg-zinc-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {bulkMode ? "Cancel" : "Verify Many"}
                </Button>
              </div>

              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  placeholder={`Search by ${
                    searchBy === "studentCode" ? "Student Code" : "Batch Name"
                  }...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <select
                  value={searchBy}
                  onChange={(e) =>
                    setSearchBy(e.target.value as "studentCode" | "batchName")
                  }
                  className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white cursor-pointer"
                >
                  <option value="studentCode">Student Code</option>
                  <option value="batchName">Batch Name</option>
                </select>
              </div>

              <div className="space-y-4">
                {filteredQueueList.length === 0 ? (
                  <p className="text-muted-foreground italic">
                    {searchTerm.trim()
                      ? "No submissions found matching your search criteria."
                      : "There are no submissions to verify."}
                  </p>
                ) : (
                  filteredQueueList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg bg-zinc-900 border border-border hover:border-destructive transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          {bulkMode && (
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={() =>
                                toggleItemSelection(item.id)
                              }
                              className={`
                              w-5 h-5 mt-1 border-2 rounded transition-colors duration-200
                              ${
                                selectedItems.includes(item.id)
                                  ? "bg-green-500 border-green-500"
                                  : "bg-white border-blue-500"
                              }
                            `}
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-semibold text-foreground text-lg">
                                {item.studentCode}
                              </p>
                              <Badge
                                variant="destructive"
                                className="flex items-center gap-1 font-bold"
                              >
                                <AlertCircle className="h-3 w-3" />
                                {item.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Batch: {item.batchName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Batch ID: {item.submissionBatchId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Violations
                            </p>
                            <p className="text-2xl font-bold text-destructive">
                              {item.violationCount}
                            </p>
                          </div>
                          {!bulkMode && (
                            <Button
                              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                              onClick={() => setOpenModal(item.id)}
                            >
                              Verify
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 pl-4 border-l-2 border-destructive/30">
                        <p className="text-sm font-medium text-foreground mb-2">
                          Violation Details:
                        </p>
                        {item.violations.map((violation) => (
                          <div key={violation.id} className="text-sm">
                            <div className="flex items-start gap-2">
                              <Badge variant="outline" className="text-xs">
                                {violation.violationType}
                              </Badge>
                              <div className="flex items-center gap-2">
                                <p className="text-muted-foreground flex-4">
                                  {violation.details}
                                </p>
                                <Eye
                                  className="h-4 w-4 text-blue-500 cursor-pointer flex-shrink-0 hover:text-blue-400"
                                  onClick={() => {
                                    const url = handleUrlGithubFile(
                                      violation.details,
                                      item.gitHubRepositoryUrl
                                    );
                                    if (url !== "None") {
                                      window.open(url, "_blank");
                                    } else {
                                      alert(
                                        "File path not found in the violation details."
                                      );
                                    }
                                  }}
                                />
                              </div>
                              {violation.similarityScore !== null && (
                                <span className="text-orange-500 font-medium">
                                  {(violation.similarityScore * 100).toFixed(0)}
                                  %
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Confirm Button */}
      {bulkMode && selectedItems.length > 0 && (
        <button
          onClick={() => {
            setOpenModal("bulk");
            setCurrentCardIndex(0);
          }}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-2 font-semibold cursor-pointer transition-all hover:scale-105 z-40"
        >
          <Flag className="h-5 w-5" />
          Confirm Verify ({selectedItems.length})
        </button>
      )}

      {/* Modal Overlay */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Verify Violation{openModal === "bulk" && "s"}
                </h3>
                {openModal === "bulk" ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    Student: {currentItem?.studentCode} ({currentCardIndex + 1}/
                    {selectedItemsData.length})
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Student: {selectedItem?.studentCode}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseModal}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {openModal === "bulk" && selectedItemsData.length > 1 && (
                <div className="flex items-center justify-center gap-4 pb-4 border-b border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentCardIndex((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentCardIndex === 0}
                    className="cursor-pointer"
                  >
                    ← Previous
                  </Button>
                  <span className="text-sm font-medium">
                    {currentCardIndex + 1} / {selectedItemsData.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentCardIndex((prev) =>
                        Math.min(selectedItemsData.length - 1, prev + 1)
                      )
                    }
                    disabled={currentCardIndex === selectedItemsData.length - 1}
                    className="cursor-pointer"
                  >
                    Next →
                  </Button>
                </div>
              )}

              {(openModal === "bulk" ? currentItem : selectedItem) && (
                <div className="bg-background border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3">
                    Violation Summary
                  </h4>
                  <div className="space-y-2">
                    {(openModal === "bulk"
                      ? currentItem?.violations
                      : selectedItem?.violations
                    )?.map((violation) => (
                      <div
                        key={violation.id}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Badge variant="outline" className="text-xs">
                          {violation.violationType}
                        </Badge>
                        <p className="text-muted-foreground flex-1">
                          {violation.details}
                        </p>
                        {violation.similarityScore !== null && (
                          <span className="text-orange-500 font-medium">
                            {(violation.similarityScore * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <h4 className="font-semibold text-foreground mb-3">
                Applies to all
              </h4>
              <div className="flex items-center space-x-3">
                <label
                  htmlFor="violation-confirm"
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  I confirm this is a violation
                </label>
                <Checkbox
                  id="violation-confirm"
                  checked={isViolationConfirmed}
                  onCheckedChange={(checked) =>
                    setIsViolationConfirmed(checked as boolean)
                  }
                  className={`
      w-5 h-5 flex items-center justify-center rounded border-2
      ${
        isViolationConfirmed
          ? "bg-red-600 border-red-600"
          : "bg-white border-blue-500"
      }
      transition-colors duration-200
    `}
                >
                  {isViolationConfirmed && (
                    <svg
                      className="w-3 h-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </Checkbox>
              </div>

              {/* Comment Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Moderator Comment{" "}
                  <span className="text-muted-foreground">
                    (Optional{openModal === "bulk" ? " - applies to all" : ""})
                  </span>
                </label>
                <Textarea
                  value={moderatorComment}
                  onChange={(e) => setModeratorComment(e.target.value)}
                  placeholder="Add your notes or explanation here..."
                  className="min-h-[120px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {moderatorComment.length}/500 characters
                </p>
              </div>

              {/* Verification Progress */}
              {isSubmitting && verificationProgress.length > 0 && (
                <div className="bg-background border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2 text-sm">
                    Verification Progress:
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {verificationProgress.map((msg, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground">
                        {msg}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <Button
                variant="outline"
                className="hover:!text-white cursor-pointer"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitVerification}
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                {isSubmitting ? "Submitting..." : "Submit Verification"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
