'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Award, Save, ArrowLeft, FileText, User, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
// Import types và services
import { GradingDetails, GradePayload, GradedItem } from '@/lib/types/examiner';
import { getGradingDetails, postSubmissionGrade } from '@/services/examinerServices';

// Fake data để test UI
const fakeGradingDetails: GradingDetails = {
  "submissionId": "8a5d48ea-2bcb-4782-a087-819365e161eb",
  "studentCode": "truongpmse182027",
  "originalFileName": "truongpmse182027/solution.zip",
  "status": "Assigned",
  "rubricItems": [
    {
      "id": "aec47206-fa5a-498f-b495-24249e5ab2b4",
      "criteria": "Login",
      "maxScore": 1
    },
    {
      "id": "777565f2-c277-4d59-b452-afe5e6148596",
      "criteria": "List All",
      "maxScore": 0.25
    },
    {
      "id": "67ff713b-01f0-4243-9c88-e0e56678b684",
      "criteria": "List All 2",
      "maxScore": 0.25
    },
    {
      "id": "833dc674-4427-493b-a0ae-2d73ff55c58c",
      "criteria": "Paging/Phân trang",
      "maxScore": 1
    },
    {
      "id": "dff5e98f-df09-4da3-b28f-306c1cb724bd",
      "criteria": "Add OK",
      "maxScore": 1
    },
    {
      "id": "7169dda6-6eda-4bb5-aed6-dd04e6d892b0",
      "criteria": "Display Top",
      "maxScore": 0.25
    },
    {
      "id": "1bf7140a-bf4d-4738-aa8b-22d3251cad09",
      "criteria": "Validation - Combobox",
      "maxScore": 0.25
    },
    {
      "id": "8213221f-8840-4b7f-be4a-f02e96b721af",
      "criteria": "Validation - Required",
      "maxScore": 0.25
    },
    {
      "id": "1720c968-52a5-40b4-bc47-c90e0920f7c3",
      "criteria": "Validation - Length",
      "maxScore": 0.25
    },
    {
      "id": "d6e830b1-8d10-44d3-8df4-d6ff94e2662f",
      "criteria": "Validation - No special characters",
      "maxScore": 0.5
    },
    {
      "id": "e557417c-3340-4e6c-83e4-75b8b014adf5",
      "criteria": "Update OK",
      "maxScore": 1
    },
    {
      "id": "23dc88de-f35f-4969-b3dd-9c28b6f74a26",
      "criteria": "Update Validation",
      "maxScore": 1
    },
    {
      "id": "3c0f5bf3-6bdc-4e6d-8cd4-c5880b2190db",
      "criteria": "Search - Test 1",
      "maxScore": 0.5
    },
    {
      "id": "a3e358bc-9331-4337-86d3-c9c95d3c0d8b",
      "criteria": "Search - Test 2",
      "maxScore": 0.5
    },
    {
      "id": "00361009-0152-4968-be2c-4b8ca1b827a3",
      "criteria": "Search - Test 3",
      "maxScore": 0.5
    },
    {
      "id": "fada22d9-da96-4ab4-ad78-acb704eab442",
      "criteria": "Delete with SignalR",
      "maxScore": 1.5
    }
  ]
};

export default function ExaminerGradingPage() {
    const params = useParams();
    const router = useRouter();
    const taskId = params?.taskId as string;

    // State để lưu chi tiết chấm điểm
    const [gradingDetails, setGradingDetails] = useState<GradingDetails>(fakeGradingDetails);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State để lưu điểm số của từng rubric item
    const [scores, setScores] = useState<{ [key: string]: number | string }>({});
    
    // State để lưu comment
    const [comment, setComment] = useState<string>("");
    
    // State để quản lý trạng thái submit
    const [isSubmitting, setIsSubmitting] = useState(false);

    // // GỌI API ĐỂ LẤY CHI TIẾT CHẤM ĐIỂM
    // const fetchGradingDetails = async () => {
    //     setIsLoading(true);
    //     setError(null);
    //     try {
    //         const data = await getGradingDetails(taskId);
    //         setGradingDetails(data);
    //     } catch (err: any) {
    //         console.error("Failed to fetch grading details:", err);
    //         setError("Không thể tải chi tiết bài chấm. Vui lòng thử lại.");
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // // GỌI API KHI COMPONENT ĐƯỢC MOUNT
    // useEffect(() => {
    //     if (taskId) {
    //         fetchGradingDetails();
    //     }
    // }, [taskId]);

    // Xử lý thay đổi điểm số
    const handleScoreChange = (rubricItemId: string, value: string, maxScore: number) => {
        // Nếu value rỗng, cho phép (để user có thể xóa)
        if (value === '') {
            setScores(prev => ({
                ...prev,
                [rubricItemId]: value
            }));
            return;
        }

        const numValue = parseFloat(value);
        
        // Kiểm tra nếu giá trị hợp lệ
        if (!isNaN(numValue)) {
            // Nếu vượt quá max, set về max
            if (numValue > maxScore) {
                setScores(prev => ({
                    ...prev,
                    [rubricItemId]: maxScore
                }));
                return;
            }
            
            // Nếu âm, set về 0
            if (numValue < 0) {
                setScores(prev => ({
                    ...prev,
                    [rubricItemId]: 0
                }));
                return;
            }
            
            // Giá trị hợp lệ
            setScores(prev => ({
                ...prev,
                [rubricItemId]: value
            }));
        }
    };

    const handleAdjustScore = (rubricItemId: string, adjustment: number, maxScore: number) => {
        const currentScore = scores[rubricItemId];
        const numScore = typeof currentScore === 'string' ? parseFloat(currentScore) : (currentScore || 0);
        const newScore = Math.max(0, Math.min(maxScore, numScore + adjustment));
        setScores(prev => ({
            ...prev,
            [rubricItemId]: newScore
        }));
    };

    const handleSetScore = (rubricItemId: string, score: number) => {
        setScores(prev => ({
            ...prev,
            [rubricItemId]: score
        }));
    };

    const handleSetEmptyToZero = () => {
        const emptyCount = gradingDetails.rubricItems.filter(
            item => scores[item.id] === undefined || scores[item.id] === '' || scores[item.id] === null
        ).length;
        
        if (emptyCount === 0) {
            alert('Tất cả các tiêu chí đã được chấm điểm.');
            return;
        }

        const confirm = window.confirm(`Bạn có chắc muốn đặt ${emptyCount} tiêu chí chưa chấm thành 0 điểm?`);
        if (confirm) {
            const newScores = { ...scores };
            gradingDetails.rubricItems.forEach(item => {
                if (newScores[item.id] === undefined || newScores[item.id] === '' || newScores[item.id] === null) {
                    newScores[item.id] = 0;
                }
            });
            setScores(newScores);
        }
    };

    const handleSetAllZero = () => {
        const confirm = window.confirm('Bạn có chắc muốn đặt tất cả điểm về 0?');
        if (confirm) {
            const newScores: { [key: string]: number } = {};
            gradingDetails.rubricItems.forEach(item => {
                newScores[item.id] = 0;
            });
            setScores(newScores);
        }
    };

    const calculateTotalScore = () => {
        let total = 0;
        Object.entries(scores).forEach(([rubricItemId, score]) => {
            if (score !== '' && score !== null && score !== undefined) {
                const numScore = typeof score === 'string' ? parseFloat(score) : score;
                if (!isNaN(numScore)) {
                    total += numScore;
                }
            }
        });
        return total.toFixed(2);
    };

    const calculateMaxScore = () => {
        return gradingDetails.rubricItems.reduce((sum, item) => sum + item.maxScore, 0).toFixed(2);
    };

    const handleSubmitGrade = async () => {
        const missingScores = gradingDetails.rubricItems.filter(
            item => scores[item.id] === undefined || scores[item.id] === '' || scores[item.id] === null
        );

        if (missingScores.length > 0) {
            alert(`Vui lòng nhập điểm cho tất cả các tiêu chí. Còn thiếu: ${missingScores.map(i => i.criteria).join(', ')}`);
            return;
        }

        const invalidScores = gradingDetails.rubricItems.filter(item => {
            const scoreValue = scores[item.id];
            const score = typeof scoreValue === 'string' 
                ? parseFloat(scoreValue) 
                : (scoreValue as number);
            return isNaN(score) || score > item.maxScore || score < 0;
        });

        if (invalidScores.length > 0) {
            alert(`Điểm không hợp lệ cho: ${invalidScores.map(i => `${i.criteria} (max: ${i.maxScore})`).join(', ')}`);
            return;
        }

        const gradedItems: GradedItem[] = gradingDetails.rubricItems.map(item => {
            const scoreValue = scores[item.id];
            const score = typeof scoreValue === 'string' 
                ? parseFloat(scoreValue) 
                : (scoreValue as number);
            return {
                rubricItemId: item.id,
                score: score
            };
        });

        const payload: GradePayload = {
            submissionId: gradingDetails.submissionId,
            comment: comment.trim(),
            gradedItems: gradedItems
        };

        console.log("Payload to submit:", payload);

        // setIsSubmitting(true);
        // try {
        //     const response = await postSubmissionGrade(payload);
        //     alert(`Chấm điểm thành công! ${response.message}`);
        //     // Chuyển về trang task list
        //     router.push('/examiner/tasks');
        // } catch (err: any) {
        //     console.error("Failed to submit grade:", err);
        //     alert("Không thể gửi điểm. Vui lòng thử lại.");
        // } finally {
        //     setIsSubmitting(false);
        // }

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            alert("Chấm điểm thành công! (Demo mode)");
            // router.push('/examiner');
        }, 1000);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Đang tải chi tiết bài chấm...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-destructive">
                <p>Lỗi: {error}</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background">
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="p-8 max-w-full">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                className="mb-4 gap-2"
                                onClick={() => router.push('/examiner')}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Task List
                            </Button>
                            <h2 className="text-3xl font-bold text-foreground mb-2">Grade Submission</h2>
                            <p className="text-muted-foreground">Review and assign scores for each criteria</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="rounded-lg bg-card border border-border p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <User className="h-5 w-5 text-primary" />
                                    <p className="text-sm font-medium text-muted-foreground">Student</p>
                                </div>
                                <p className="text-2xl font-bold text-foreground">{gradingDetails.studentCode}</p>
                            </div>

                            <div className="rounded-lg bg-card border border-border p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <p className="text-sm font-medium text-muted-foreground">File</p>
                                </div>
                                <p className="text-sm font-semibold text-foreground truncate">{gradingDetails.originalFileName}</p>
                            </div>

                            <div className="rounded-lg bg-card border border-border p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Award className="h-5 w-5 text-primary" />
                                    <p className="text-sm font-medium text-muted-foreground">Total Score</p>
                                </div>
                                <p className="text-2xl font-bold text-primary">
                                    {calculateTotalScore()} / {calculateMaxScore()}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-lg bg-card border border-border p-6 mb-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Award className="h-5 w-5 text-primary" />
                                Grading Sheet
                            </h3>

                            <div className="relative w-full">
                                <div 
                                    className="overflow-x-auto border border-border rounded-lg"
                                    style={{
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: 'hsl(var(--primary)) hsl(var(--muted))'
                                    }}
                                >
                                    <style jsx>{`
                                        div::-webkit-scrollbar {
                                            height: 8px;
                                        }
                                        div::-webkit-scrollbar-track {
                                            background: hsl(var(--muted));
                                            border-radius: 4px;
                                        }
                                        div::-webkit-scrollbar-thumb {
                                            background: hsl(var(--primary));
                                            border-radius: 4px;
                                        }
                                        div::-webkit-scrollbar-thumb:hover {
                                            background: hsl(var(--primary) / 0.8);
                                        }
                                    `}</style>
                                    <table className="border-collapse table-fixed" style={{ width: `${150 + (gradingDetails.rubricItems.length * 180) + 100}px` }}>
                                        <thead>
                                            <tr>
                                                <th className="border border-border bg-muted p-3 text-left text-sm font-semibold text-foreground" style={{ width: '200px' }}>
                                                    Student Code
                                                </th>
                                                {gradingDetails.rubricItems.map((item) => (
                                                    <th 
                                                        key={item.id} 
                                                        className="border border-border bg-muted p-3 text-center text-xs font-semibold text-foreground"
                                                        style={{ width: '180px' }}
                                                    >
                                                        <div className="flex flex-col gap-1">
                                                            <span>{item.criteria}</span>
                                                            <span className="text-primary font-bold">({item.maxScore})</span>
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="border border-border bg-primary/10 p-3 text-center text-sm font-bold text-primary" style={{ width: '100px' }}>
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border border-border bg-background p-3 font-semibold text-foreground">
                                                    {gradingDetails.studentCode}
                                                </td>
                                                {gradingDetails.rubricItems.map((item) => (
                                                    <td key={item.id} className="border border-border bg-background p-2">
                                                        <div className="flex flex-col gap-2">
                                                            <Input
                                                                type="number"
                                                                step="0.25"
                                                                min="0"
                                                                max={item.maxScore}
                                                                value={scores[item.id] ?? ''}
                                                                onChange={(e) => handleScoreChange(item.id, e.target.value, item.maxScore)}
                                                                className="w-full text-center h-9 text-sm font-semibold px-0 placeholder:text-center"
                                                                placeholder="-"
                                                            />
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="flex-1 h-7 text-xs px-1"
                                                                    onClick={() => handleSetScore(item.id, 0)}
                                                                    title="Set to 0"
                                                                >
                                                                    0
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="flex-1 h-7 text-xs px-1"
                                                                    onClick={() => handleAdjustScore(item.id, -0.5, item.maxScore)}
                                                                    title="Subtract 0.5"
                                                                >
                                                                    -0.5
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="flex-1 h-7 text-xs px-1"
                                                                    onClick={() => handleAdjustScore(item.id, 0.5, item.maxScore)}
                                                                    title="Add 0.5"
                                                                >
                                                                    +0.5
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="flex-1 h-7 text-xs px-1"
                                                                    onClick={() => handleSetScore(item.id, item.maxScore)}
                                                                    title="Set to Max"
                                                                >
                                                                    Max
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                ))}
                                                <td className="border border-border bg-primary/5 p-3 text-center font-bold text-primary text-lg">
                                                    {calculateTotalScore()}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-card border border-border p-6 mb-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Additional Comments (Optional)</h3>
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Enter your feedback or comments here..."
                                className="min-h-[100px] resize-none"
                                maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground mt-2">{comment.length}/500 characters</p>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/examiner')}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleSetEmptyToZero}
                            >
                                Set Empty to 0
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleSetAllZero}
                            >
                                Set All to 0
                            </Button>
                            <Button
                                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={handleSubmitGrade}
                                disabled={isSubmitting}
                            >
                                <Save className="h-4 w-4" />
                                {isSubmitting ? 'Submitting...' : 'Subssmit Grade'}
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}