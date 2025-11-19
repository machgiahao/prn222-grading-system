'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Award, Save, ArrowLeft, FileText, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GradingDetails, GradePayload, GradedItem } from '@/lib/types/examiner';
import { getGradingDetails, postSubmissionGrade } from '@/services/examinerServices';

export default function ExaminerGradingPage() {
    const params = useParams();
    const router = useRouter();
    const taskId = params?.taskId as string;
    
    // Khởi tạo state là null thay vì fake data
    const [gradingDetails, setGradingDetails] = useState<GradingDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scores, setScores] = useState<{ [key: string]: number | string }>({});
    const [comment, setComment] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchGradingDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getGradingDetails(taskId);
            setGradingDetails(data);
        } catch (err: any) {
            console.error("Failed to fetch grading details:", err);
            setError("Unable to load grading details. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (taskId) {
            fetchGradingDetails();
        }
    }, [taskId]);

    const handleScoreChange = (rubricItemId: string, value: string, maxScore: number) => {
        if (value === '') {
            setScores(prev => ({
                ...prev,
                [rubricItemId]: value
            }));
            return;
        }

        const numValue = parseFloat(value);
        
        if (!isNaN(numValue)) {
            if (numValue > maxScore) {
                setScores(prev => ({
                    ...prev,
                    [rubricItemId]: maxScore
                }));
                return;
            }
            
            if (numValue < 0) {
                setScores(prev => ({
                    ...prev,
                    [rubricItemId]: 0
                }));
                return;
            }
            
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
        if (!gradingDetails) return;
        
        const emptyCount = gradingDetails.rubricItems.filter(
            item => scores[item.id] === undefined || scores[item.id] === '' || scores[item.id] === null
        ).length;
        
        if (emptyCount === 0) {
            alert('All criteria have been scored.');
            return;
        }

        const confirm = window.confirm(`Are you sure you want to set ${emptyCount} ungraded criteria to 0?`);
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
        if (!gradingDetails) return;
        
        const confirm = window.confirm('Are you sure you want to reset all scores to 0?');
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
        if (!gradingDetails) return '0.00';
        return gradingDetails.rubricItems.reduce((sum, item) => sum + item.maxScore, 0).toFixed(2);
    };

    const handleSubmitGrade = async () => {
        if (!gradingDetails) return;
        
        const missingScores = gradingDetails.rubricItems.filter(
            item => scores[item.id] === undefined || scores[item.id] === '' || scores[item.id] === null
        );

        if (missingScores.length > 0) {
            alert(`Please enter scores for all criteria. Missing: ${missingScores
                .map(i => i.criteria)
                .join(', ')}`);
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
            alert(`Invalid score for: ${invalidScores
                .map(i => `${i.criteria} (max: ${i.maxScore})`)
                .join(', ')}`);
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

        setIsSubmitting(true);
        try {
            const response = await postSubmissionGrade(payload);
            alert(`Grading successful! ${response.message}`);
            router.push('/examiner/tasks');
        } catch (err: any) {
            console.error("Failed to submit grade:", err);
            alert("Failed to submit grade. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading grading details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-background">
                <div className="text-center max-w-md">
                    <div className="text-destructive text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Error</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" className='hover:cursor-pointer' onClick={() => router.push('/examiner/tasks')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Tasks
                        </Button>
                        <Button className='hover:cursor-pointer' onClick={fetchGradingDetails}>
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Data not available state
    if (!gradingDetails) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <p className="text-muted-foreground">No grading details available.</p>
            </div>
        );
    }

    // Main content - chỉ render khi đã có data
    return (
        <div className="flex h-screen bg-background">
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="p-8 max-w-full">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                className="mb-4 gap-2 hover:bg-primary !text-white cursor-pointer"
                                onClick={() => router.push('/examiner/tasks')}
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
                                                                    className="flex-1 h-7 text-xs px-1 hover:cursor-pointer"
                                                                    onClick={() => handleSetScore(item.id, 0)}
                                                                    title="Set to 0"
                                                                >
                                                                    0
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="flex-1 h-7 text-xs px-1 hover:cursor-pointer"
                                                                    onClick={() => handleAdjustScore(item.id, -0.5, item.maxScore)}
                                                                    title="Subtract 0.5"
                                                                >
                                                                    -0.5
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="flex-1 h-7 text-xs px-1 hover:cursor-pointer"
                                                                    onClick={() => handleAdjustScore(item.id, 0.5, item.maxScore)}
                                                                    title="Add 0.5"
                                                                >
                                                                    +0.5
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="flex-1 h-7 text-xs px-1 hover:cursor-pointer"
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
                                className="hover:bg-primary !text-white"
                                onClick={() => router.push('/examiner/tasks')}
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
                                {isSubmitting ? 'Submitting...' : 'Submit Grade'}
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}