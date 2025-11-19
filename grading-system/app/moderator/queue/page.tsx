'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronRight, Flag } from 'lucide-react';
import { ModerationQueueItem } from '@/lib/types/moderator';
// import { getModerationQueue } from '@/services/moderatorServices';

const fakeData: ModerationQueueItem[] = [
  {
    "id": "6932ff65-9078-4d83-bcf6-3246f5bf70bc",
    "studentCode": "VuTTSE184370",
    "status": "Flagged",
    "submissionBatchId": "257a5419-ac2e-4e55-a288-cb4e6b4e7b92",
    "batchName": "5a49ab72-c452-4060-96c5-1ef3c6c39c9b.rar",
    "violationCount": 4,
    "violations": [
      {
        "id": "11d269ff-cccf-42b1-91b5-aa28fd8969a9",
        "violationType": "Keyword",
        "details": "Forbidden keyword: 'Lion' (in file: PantherPetManagement_TruongTuanVu.Business/PantherProfileService.cs)",
        "similarityScore": null
      },
      {
        "id": "219060bb-b9e5-4c63-8ce6-a7828190cb47",
        "violationType": "Keyword",
        "details": "Forbidden keyword: 'Lion' (in file: PantherPetManagement_TruongTuanVu.Data/PantherProfileRepository.cs)",
        "similarityScore": null
      },
      {
        "id": "b6d6201b-9686-4960-9704-e54c014ac2e0",
        "violationType": "Keyword",
        "details": "Forbidden keyword: 'Lion' (in file: PantherPetManagement_TruongTuanVu.Business/IPantherProfileService.cs)",
        "similarityScore": null
      },
      {
        "id": "cabf3997-e878-4b3d-9593-9affb385d562",
        "violationType": "Keyword",
        "details": "Forbidden keyword: 'Lion' (in file: PantherPetManagement_TruongTuanVu/PantherProfiles/Index.cshtml.cs)",
        "similarityScore": null
      }
    ]
  },
  {
    "id": "e765057f-c8c7-4366-8363-7eae498ca247",
    "studentCode": "vietnse180672",
    "status": "Flagged",
    "submissionBatchId": "257a5419-ac2e-4e55-a288-cb4e6b4e7b92",
    "batchName": "5a49ab72-c452-4060-96c5-1ef3c6c39c9b.rar",
    "violationCount": 2,
    "violations": [
      {
        "id": "0755d296-d482-4b25-b44e-7eb627aa79a0",
        "violationType": "Keyword",
        "details": "Forbidden keyword: 'Lion' (in file: DataAccess/Daos/ProfileDao.cs)",
        "similarityScore": null
      },
      {
        "id": "ca7c9269-adb5-48ca-9708-164d76193682",
        "violationType": "Keyword",
        "details": "Forbidden keyword: 'Lion' (in file: DataAccess/Repositories/ProfileRepository.cs)",
        "similarityScore": null
      }
    ]
  }
];

export default function ModerationQueuePage() {
  // State để lưu danh sách moderaton queue
  const [queueList, setQueueList] = useState<ModerationQueueItem[]>(fakeData);
  // State để quản lý trạng thái tải (loading) và lỗi (error)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const fetchModerationQueue = async () => {
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     // GỌI API VÀ CẬP NHẬT STATE
  //     const data = await getModerationQueue();
  //     setQueueList(data);
  //   } catch (err: any) {
  //     console.error("Failed to fetch moderation queue:", err);
  //     setError("Không thể tải danh sách vi phạm. Vui lòng thử lại.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // // GỌI API KHI COMPONENT ĐƯỢC MOUNT
  // useEffect(() => {
  //   fetchModerationQueue();
  // }, []);

  // -------------------- LOGIC RENDER --------------------

  // Trạng thái Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Đang tải danh sách vi phạm...</p>
      </div>
    );
  }

  // Trạng thái Lỗi
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-destructive">
        <p>Lỗi: {error}</p>
      </div>
    );
  }

  // Tổng số bài nộp cần xác minh
  const totalQueue = queueList.length;
  const totalViolations = queueList.reduce((sum, item) => sum + item.violationCount, 0);

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Tiêu đề */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Moderation Queue</h2>
              <p className="text-muted-foreground">Review and verify flagged submissions</p>
            </div>

            {/* Thẻ thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="rounded-lg bg-card border border-border p-6">
                <p className="text-muted-foreground text-sm mb-2">Pending Review</p>
                <p className="text-4xl font-bold text-destructive">{totalQueue}</p>
                <p className="text-xs text-muted-foreground mt-2">Submissions</p>
              </div>
              
              <div className="rounded-lg bg-card border border-border p-6">
                <p className="text-muted-foreground text-sm mb-2">Total Violations</p>
                <p className="text-4xl font-bold text-orange-500">{totalViolations}</p>
                <p className="text-xs text-muted-foreground mt-2">Detected issues</p>
              </div>
            </div>

            {/* Danh sách bài nộp vi phạm */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Flag className="h-5 w-5 text-destructive" />
                Flagged Submissions ({totalQueue} items)
              </h3>

              <div className="space-y-4">
                {queueList.length === 0 ? (
                  <p className="text-muted-foreground italic">
                    Không có bài nộp nào cần xác minh.
                  </p>
                ) : (
                  queueList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg bg-background border border-border hover:border-destructive transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-foreground text-lg">{item.studentCode}</p>
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Batch: {item.batchName}</p>
                          <p className="text-sm text-muted-foreground">Batch ID: {item.submissionBatchId}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Violations</p>
                            <p className="text-2xl font-bold text-destructive">{item.violationCount}</p>
                          </div>
                          <Button 
                            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => {
                              window.location.href = `/moderator/${item.id}`;
                            }}
                          >
                            Review
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Danh sách vi phạm */}
                      <div className="mt-4 space-y-2 pl-4 border-l-2 border-destructive/30">
                        <p className="text-sm font-medium text-foreground mb-2">Violation Details:</p>
                        {item.violations.map((violation) => (
                          <div key={violation.id} className="text-sm">
                            <div className="flex items-start gap-2">
                              <Badge variant="outline" className="text-xs">
                                {violation.violationType}
                              </Badge>
                              <p className="text-muted-foreground flex-1">{violation.details}</p>
                              {violation.similarityScore !== null && (
                                <span className="text-orange-500 font-medium">
                                  {(violation.similarityScore * 100).toFixed(0)}%
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
    </div>
  );
}