'use client';

// Các imports khác...
import { Button } from '@/components/ui/button';
import { Award, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
// Import type và service
import { MyTask } from '@/lib/types/common';
import { getMyTasks } from '@/services/examinerServices'; 
// Giả sử examinerServices là tên file dịch vụ chứa getMyTasks

const fakeData: MyTask[] = [
    {
      "id": "8a5d48ea-2bcb-4782-a087-819365e161eb",
      "studentCode": "truongpmse182027",
      "status": "Assigned",
      "submissionBatchId": "257a5419-ac2e-4e55-a288-cb4e6b4e7b92"
    },
    {
      "id": "cc1f7260-75d5-4328-b381-790b7f8de3fb",
      "studentCode": "VuNDHSE181551",
      "status": "Assigned",
      "submissionBatchId": "257a5419-ac2e-4e55-a288-cb4e6b4e7b92"
    }
  ]
export default function TasksPage() {

    
    // State để lưu danh sách nhiệm vụ
    const [taskList, setTaskList] = useState<MyTask[]>(fakeData);
    // State để quản lý trạng thái tải (loading) và lỗi (error)
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // const fetchTasks = async () => {
    //     setIsLoading(true);
    //     setError(null);
    //     try {
    //         // GỌI API VÀ CẬP NHẬT STATE
    //         const data = await getMyTasks(); 
    //         setTaskList(data);
    //     } catch (err: any) {
    //         console.error("Failed to fetch tasks:", err);
    //         // Xử lý lỗi (ví dụ: hiển thị thông báo nếu API trả về lỗi 500)
    //         setError("Không thể tải danh sách nhiệm vụ. Vui lòng thử lại.");
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }

    // // GỌI API KHI COMPONENT ĐƯỢC MOUNT
    // useEffect(() => {
    //     fetchTasks();
    // }, []); // Mảng phụ thuộc rỗng đảm bảo chỉ chạy 1 lần sau render đầu tiên

    // -------------------- LOGIC RENDER --------------------

    // Trạng thái Loading
    // if (isLoading) {
    //     return (
    //         <div className="flex justify-center items-center h-screen">
    //             <p>Đang tải nhiệm vụ...</p>
    //         </div>
    //     );
    // }

    // Trạng thái Lỗi
    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-destructive">
                <p>Lỗi: {error}</p>
            </div>
        );
    }
    
    // Tổng số nhiệm vụ còn lại
    const remainingTasks = taskList.length;

    return (
        <div className="flex h-screen bg-background">
            <div className="flex-1 flex flex-col">
                {/* ... DashboardHeader và main ... */}
                
                <main className="flex-1 overflow-auto">
                    <div className="p-8">
                        {/* ... Tiêu đề ... */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-foreground mb-2">Task List</h2>
                            <p className="text-muted-foreground">Review and grade student submissions</p>
                        </div>

                        {/* Thẻ thống kê */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="rounded-lg bg-card border border-border p-6">
                                <p className="text-muted-foreground text-sm mb-2">Remain in queue</p>
                                <p className="text-4xl font-bold text-primary">{remainingTasks}</p>
                                <p className="text-xs text-muted-foreground mt-2">Submissions</p>
                            </div>
                            {/* ... Các thẻ thống kê khác nếu cần ... */}
                        </div>

                        {/* Danh sách nhiệm vụ hiện tại */}
                        <div className="rounded-lg bg-card border border-border p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                                <Award className="h-5 w-5 text-primary" />
                                Your Grading Queue ({remainingTasks} items)
                            </h3>

                            <div className="space-y-4">
                                {/* DÙNG DỮ LIỆU THỰC TẾ: taskList */}
                                {taskList.length === 0 ? (
                                    <p className="text-muted-foreground italic">
                                        Không có bài nộp nào được giao cho bạn.
                                    </p>
                                ) : (
                                    taskList.map((task) => (
                                        <div
                                            // Sử dụng ID của bài nộp làm key
                                            key={task.id} 
                                            className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-primary transition"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        {/* Hiển thị StudentCode và SubmissionBatchId */}
                                                        <p className="font-semibold text-foreground">{task.studentCode}</p>
                                                        <p className="text-sm text-muted-foreground">Batch ID: {task.submissionBatchId}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {/* Hiển thị Status */}
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                            task.status === 'Assigned' ? 'bg-yellow-100 text-yellow-800' :
                                                            task.status === 'Grading' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                            {task.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Thay thế href để chuyển đến trang chấm điểm */}
                                            <Button 
                                                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                                                onClick={() => {
                                                    window.location.href = `/examiner/${task.id}`;
                                                }}
                                            >
                                                Grade
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
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