'use client';

import { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Upload, ClipboardList, AlertCircle, Loader2, FileText, Users, Search, X, FolderArchive, Award, LogOut, CheckCircle2 } from 'lucide-react';
import { AllSubmissionParameters, Examiner, GetAllExamResponse, SubmissionData, SubmissionUploadPayload } from '@/lib/types/manager';
import { autoAssign, getAllExam, getAllExaminers, getAllSubmissions, uploadSubmissions } from '@/services/managerServices';
import SubmissionsTable from '@/components/SubmissionsTable';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'scanning', label: 'Scanning' },
    { value: 'flagged', label: 'Flagged' },
    { value: 'readytograde', label: 'Ready to Grade' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'graded', label: 'Graded' },
    { value: 'completed', label: 'Completed' },
    { value: 'verified', label: 'Verified' },
];

interface ProgressData {
  batchId: string;
  percentage: number;
  stage: string;
  message: string;
  timestamp: string;
}

interface ErrorData {
  batchId: string;
  error: string;
  timestamp: string;
}

interface CompletionData {
  batchId: string;
  totalSubmissions: number;
  completedAt: string;
}

export default function ManagerDashboard() {
    const { userTokenData, logout } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedExamId, setSelectedExamId] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Modal states
    const [openModal, setOpenModal] = useState(false);
    const [modalSelectedBatchId, setModalSelectedBatchId] = useState('');
    const [selectedExaminers, setSelectedExaminers] = useState<string[]>([]);

    // Upload modal states
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [selectedZipFile, setSelectedZipFile] = useState<File | null>(null);
    const [uploadExamId, setUploadExamId] = useState('');

    // SignalR Upload Progress States
    const [uploadBatchId, setUploadBatchId] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStage, setUploadStage] = useState('');
    const [uploadMessage, setUploadMessage] = useState('');
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadCompleted, setUploadCompleted] = useState(false);
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

    // Data states
    const [submissionData, setSubmissionData] = useState<SubmissionData[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [batches, setBatches] = useState<string[]>([]);
    const [examinerList, setExaminerList] = useState<Examiner[]>([]);
    const [examList, setExamList] = useState<GetAllExamResponse[]>([]);
    
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7002";

    // Pagination state
    const [pagination, setPagination] = useState({
        pageIndex: 1,
        pageSize: 10
    });

    //  SignalR Connection Setup
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        
        if (!uploadBatchId || !accessToken) {
            console.log("Missing uploadBatchId or accessToken");
            return;
        }

        const hubUrl = `${apiBaseUrl}/hubs/upload-progress`;
        console.log("🌐 Connecting to:", hubUrl);

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => accessToken,
                transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
                skipNegotiation: false,
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000])
            .configureLogging(signalR.LogLevel.Debug)
            .build();

        newConnection.onclose((error) => {
            console.log("🔌 Connection closed:", error);
        });

        newConnection.onreconnecting((error) => {
            console.log("Reconnecting:", error);
        });

        newConnection.onreconnected(async (connectionId) => {
            console.log(" Reconnected. ConnectionId:", connectionId);
            
            //  Re-join group after reconnect
            if (uploadBatchId) {
                try {
                    await newConnection.invoke('JoinUploadGroup', uploadBatchId);
                    console.log(` Re-joined group for batch: ${uploadBatchId}`);
                } catch (err) {
                    console.error("Failed to re-join group:", err);
                }
            }
        });

        //  Subscribe to progress events
        newConnection.on('ReceiveProgress', (data: ProgressData) => {
            console.log('Progress:', data);
            setUploadProgress(data.percentage);
            setUploadStage(data.stage);
            setUploadMessage(data.message);
            
            if (data.stage === 'Complete' && data.percentage === 100) {
                toast.success(data.message);
                
                //  Refresh submissions immediately after upload completes
                console.log('Refreshing submissions after upload completion...');
                fetchSubmissions({ 
                    pageIndex: pagination.pageIndex, 
                    pageSize: pagination.pageSize,
                    examId: selectedExamId || undefined,
                    submissionBatchId: selectedBatchId || undefined,
                    status: selectedStatus || undefined
                });
            }
        });


        newConnection.on('ReceiveError', (data: ErrorData) => {
            console.error('Error:', data);
            setUploadError(data.error);
            setIsUploading(false);
            toast.error(`Upload failed: ${data.error}`);
        });

        newConnection.on('ReceiveCompletion', (data: CompletionData) => {
            console.log('Completed:', data);
            setUploadCompleted(true);
            setIsUploading(false);
            toast.success(`Processing completed! Total submissions: ${data.totalSubmissions}`);
            
            console.log('Refreshing submissions after scan completion...');
            fetchSubmissions({ 
                pageIndex: pagination.pageIndex, 
                pageSize: pagination.pageSize,
                examId: selectedExamId || undefined,
                submissionBatchId: selectedBatchId || undefined,
                status: selectedStatus || undefined
            });
        });

        const startConnection = async (retries = 3) => {
            for (let i = 0; i < retries; i++) {
                try {
                    await newConnection.start();
                    console.log(' SignalR Connected, ConnectionId:', newConnection.connectionId);
                    
                    await newConnection.invoke('JoinUploadGroup', uploadBatchId);
                    console.log(` Successfully joined group for batch: ${uploadBatchId}`);
                    
                    setConnection(newConnection);
                    return;
                } catch (err) {
                    console.error(`Connection attempt ${i + 1}/${retries} failed:`, err);
                    
                    if (i === retries - 1) {
                        toast.error('Failed to connect to progress tracker');
                        setIsUploading(false);
                    } else {
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                    }
                }
            }
        };

        startConnection();

        return () => {
            if (newConnection) {
                console.log("🧹 Cleaning up SignalR connection for batch:", uploadBatchId);
                
                const cleanup = async () => {
                    try {
                        if (newConnection.state === signalR.HubConnectionState.Connected) {
                            await newConnection.invoke('LeaveUploadGroup', uploadBatchId);
                            console.log(" Left group successfully");
                        }
                    } catch (err) {
                        console.error("Error leaving group:", err);
                    } finally {
                        try {
                            await newConnection.stop();
                            console.log(" Connection stopped");
                        } catch (err) {
                            console.error("Error stopping connection:", err);
                        }
                    }
                };
                
                cleanup();
            }
        };
    }, [uploadBatchId]);

    const fetchSubmissions = async (params: AllSubmissionParameters) => {
        setLoading(true);
        setError(null);
        try {
            if(params.pageIndex < 1) params.pageIndex = 1;
            const data = await getAllSubmissions({
                ...params,
                pageIndex: params.pageIndex - 1
            });
            setSubmissionData(data.data);
            setTotalCount(data.count);
        } catch (err) {
            console.error("Error fetching submissions:", err);
            setError("Failed to load submissions data. Please try again.");
            setSubmissionData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    const getBatches = () => {
        if(submissionData && submissionData.length > 0){
            const uniqueBatches = Array.from(new Set(submissionData.map(sub => sub.submissionBatchId)));
            setBatches(uniqueBatches);
        }
    }

    const fetchExaminers = async () => {
        try {
            const data = await getAllExaminers({ pageIndex: 0, pageSize: 100 });
            setExaminerList(data.data);
        }catch(err){
            console.error("Error fetching examiners:", err);
        }
    }

    const fetchAllExams = async () => {
        try{
            const data = await getAllExam();
            if(data){
                setExamList(data);
            }
        }catch(err){
            console.error("Error fetching exams:", err);
        }
    }

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
        
        fetchSubmissions({ 
            pageIndex: 1, 
            pageSize: pagination.pageSize,
            examId: selectedExamId || undefined,
            submissionBatchId: selectedBatchId || undefined,
            status: selectedStatus || undefined
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedBatchId('');
        setSelectedStatus('');
        setSelectedExamId('');
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
        
        fetchSubmissions({ 
            pageIndex: 1, 
            pageSize: pagination.pageSize
        });
    };

    const hasActiveFilters = searchTerm || selectedBatchId || selectedStatus || selectedExamId;

    const handleExaminerSelection = (examinerId: string) => {
        setSelectedExaminers(prev => 
            prev.includes(examinerId) 
                ? prev.filter(id => id !== examinerId)
                : [...prev, examinerId]
        );
    };

    const handleSelectAllExaminers = () => {
        if (selectedExaminers.length === examinerList.length) {
            setSelectedExaminers([]);
        } else {
            setSelectedExaminers(examinerList.map(examiner => examiner.id));
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            console.log("File selection canceled");
            return;
        }
        if (file && (file.name.endsWith('.zip') || file.name.endsWith('.rar'))) {
            setSelectedZipFile(file);
        } else if (file) {
            toast.error('Please select a ZIP or RAR file');
        }
    };

    const handleUploadSubmission = async () => {
        if (!selectedZipFile || !uploadExamId) {
            toast.error('Please fill in all fields');
            return;
        }

        // Reset states
        setIsUploading(true);
        setUploadError(null);
        setUploadProgress(0);
        setUploadStage('');
        setUploadMessage('');
        setUploadCompleted(false);
        setUploadBatchId(null);

        const payload: SubmissionUploadPayload = {
            RarFile: selectedZipFile,
            ExamId: uploadExamId,
        };

        try {
            const result = await uploadSubmissions(payload);
            
            console.log('Upload started, BatchId:', result.batchId);
            setUploadBatchId(result.batchId);
            toast.success('Upload started! Tracking progress...');
            
            handleCloseUploadModal();
            
        } catch(err: any) {
            console.error("Error uploading:", err);
            setUploadError(err.message || 'Upload failed');
            setIsUploading(false);
            toast.error(err.message || 'Upload failed');
        }
    };

    const handleCloseUploadModal = () => {
        setSelectedZipFile(null);
        setUploadExamId('');
        setOpenUploadModal(false);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleAssignMany = async () => {
        if (!modalSelectedBatchId || selectedExaminers.length === 0) {
            toast.error('Please select a batch and at least one examiner');
            return;
        }

        const payload = {
            submissionBatchId: modalSelectedBatchId,
            examinerIds: selectedExaminers
        };

        try {
            const response = await autoAssign(payload);
            if(response.message){
                toast.success(`Successfully assigned ${response.assignedSubmissionCount} submissions.`);
                fetchSubmissions({ 
                    pageIndex: pagination.pageIndex, 
                    pageSize: pagination.pageSize,
                    examId: selectedExamId || undefined,
                    submissionBatchId: selectedBatchId || undefined,
                    status: selectedStatus || undefined
                });
            }else{
                toast.error("Failed to assign submissions.");
            }
        } catch(err) {
            console.error("Error in auto assign:", err);
            toast.error("Error assigning submissions. Please try again.");
        }
        
        setModalSelectedBatchId('');
        setSelectedExaminers([]);
        setOpenModal(false);
    };

    const handleCloseModal = () => {
        setModalSelectedBatchId('');
        setSelectedExaminers([]);
        setOpenModal(false);
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, pageIndex: newPage }));
    };

    const handleAssignSuccess = () => {
        fetchSubmissions({ 
            pageIndex: pagination.pageIndex, 
            pageSize: pagination.pageSize,
            examId: selectedExamId || undefined,
            submissionBatchId: selectedBatchId || undefined,
            status: selectedStatus || undefined
        });
    };

    const handleCloseUploadProgress = () => {
        setUploadBatchId(null);
        setUploadProgress(0);
        setUploadStage('');
        setUploadMessage('');
        setUploadError(null);
        setIsUploading(false);
        setUploadCompleted(false);
    };

    const totalViolationCount = submissionData.filter(sub => sub.status === 'Flagged').length;
    const totalBatchCount = batches.length;

    useEffect(() => {
        fetchSubmissions({ 
            pageIndex: pagination.pageIndex, 
            pageSize: pagination.pageSize,
            examId: selectedExamId || undefined,
            submissionBatchId: selectedBatchId || undefined,
            status: selectedStatus || undefined
        });
    }, [pagination.pageIndex, pagination.pageSize]);

    useEffect(() => {
        getBatches();
    }, [submissionData]);

    useEffect(() => {
        fetchExaminers();
        fetchAllExams();
    }, []);

    const handleLogout = () => {
        logout();
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen bg-gray-900 p-8 pb-24">
            <header className="border-b border-zinc-800 bg-zinc-900">
                <div className="container mx-auto px-4 py-4 max-w-6xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Award className="w-8 h-8 text-blue-500" />
                            <div>
                                <h1 className="text-xl font-bold text-white">Grading System</h1>
                                <p className="text-sm text-gray-400">Manager Portal</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="gap-2 bg-transparent border-zinc-700 text-white hover:bg-red-600 hover:border-red-600 transition-colors"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-100">Manager Dashboard</h1>
                    <p className="text-gray-400 mt-1">
                        Manage submission batches and monitor grading progress.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-gray-800 border-gray-700">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Total Submissions</p>
                                <p className="text-3xl font-bold mt-2 text-gray-100">{totalCount}</p>
                            </div>
                            <div className="bg-indigo-600 p-3 rounded-lg text-white">
                                <FileText size={24} />
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 bg-gray-800 border-gray-700">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Total Batches</p>
                                <p className="text-3xl font-bold mt-2 text-gray-100">{totalBatchCount}</p>
                            </div>
                            <div className="bg-blue-500 p-3 rounded-lg text-white">
                                <ClipboardList size={24} />
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 bg-gray-800 border-gray-700">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Total Violations</p>
                                <p className="text-3xl font-bold mt-2 text-gray-100">{totalViolationCount}</p>
                            </div>
                            <div className="bg-red-500 p-3 rounded-lg text-white">
                                <AlertCircle size={24} />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Upload Button */}
                <Card className="p-6 bg-gray-800 border-gray-700">
                    <h3 className="font-bold mb-4 text-xl text-gray-100">Upload Submission Batch</h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Upload a RAR/ZIP file containing student submissions to start a new grading batch.
                    </p>
                    <Button className="w-full" onClick={() => setOpenUploadModal(true)}>
                        <Upload size={18} className="mr-2" />
                        Upload New Batch
                    </Button>
                </Card>

                {/* Submissions Table Section */}
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-gray-100">List of Submissions</h2>
                    
                    {/* Search and Filters */}
                    <Card className="p-6 mb-4 bg-gray-800 border-gray-700">
                        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
                            <div className="lg:col-span-7 space-y-4">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                                        <Input
                                            placeholder="Search by examiner name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-blue-500"
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                    <Button
                                        onClick={() => setShowFilters(!showFilters)}
                                        variant="outline"
                                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                                    >
                                        Filters {showFilters ? '▲' : '▼'}
                                    </Button>
                                    <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                                        <Search className="h-4 w-4 mr-2" />
                                        Search
                                    </Button>
                                </div>

                                {showFilters && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-gray-700">
                                        <div>
                                            <label className="text-xs font-medium text-gray-400 mb-1 block">Exam</label>
                                            <select
                                                value={selectedExamId}
                                                onChange={(e) => setSelectedExamId(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">All Exams</option>
                                                {examList.map((exam) => (
                                                    <option key={exam.id} value={exam.id}>{exam.examCode}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-gray-400 mb-1 block">Batch ID</label>
                                            <select
                                                value={selectedBatchId}
                                                onChange={(e) => setSelectedBatchId(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">All Batches</option>
                                                {batches.map((batchId) => (
                                                    <option key={batchId} value={batchId}>{batchId}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-gray-400 mb-1 block">Status</label>
                                            <select
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">All Status</option>
                                                {statusOptions.map((status) => (
                                                    <option key={status.value} value={status.value}>{status.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {hasActiveFilters && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-medium text-gray-400">Active filters:</span>
                                        {selectedExamId && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/50 text-blue-300 border border-blue-700 rounded text-xs">
                                                Exam: {examList.find(e => e.id === selectedExamId)?.examCode}
                                                <X className="h-3 w-3 cursor-pointer hover:text-blue-100" onClick={() => setSelectedExamId('')} />
                                            </span>
                                        )}
                                        {selectedBatchId && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/50 text-blue-300 border border-blue-700 rounded text-xs">
                                                Batch: {selectedBatchId}
                                                <X className="h-3 w-3 cursor-pointer hover:text-blue-100" onClick={() => setSelectedBatchId('')} />
                                            </span>
                                        )}
                                        {selectedStatus && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/50 text-blue-300 border border-blue-700 rounded text-xs">
                                                Status: {statusOptions.find(s => s.value === selectedStatus)?.label}
                                                <X className="h-3 w-3 cursor-pointer hover:text-blue-100" onClick={() => setSelectedStatus('')} />
                                            </span>
                                        )}
                                        <button onClick={handleClearFilters} className="text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer">
                                            Clear all
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="lg:col-span-3 flex items-start">
                                <Button onClick={() => setOpenModal(true)} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                                    <Users className="mr-2 h-4 w-4" />
                                    Auto Assign Examiners
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <SubmissionsTable
                        data={submissionData}
                        totalCount={totalCount}
                        pageSize={pagination.pageSize}
                        currentPage={pagination.pageIndex}
                        onPageChange={handlePageChange}
                        isLoading={loading}
                        onAssignSuccess={handleAssignSuccess}
                    />
                </section>
            </div>

            {/* Upload Modal */}
            {openUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-gray-100">Upload Submission Batch</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Upload a ZIP/RAR file with exam submissions
                            </p>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">ZIP/RAR File *</label>
                                {!selectedZipFile ? (
                                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                                        <Upload className="mx-auto h-12 w-12 text-gray-500 mb-3" />
                                        <p className="text-gray-400 mb-2">Select file</p>
                                        <input
                                            type="file"
                                            accept=".zip,.rar"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="zip-upload"
                                        />
                                        <label htmlFor="zip-upload" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                                            Choose file
                                        </label>
                                    </div>
                                ) : (
                                    <div className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <FolderArchive className="h-8 w-8 text-blue-400" />
                                                <div>
                                                    <p className="font-medium text-gray-200">{selectedZipFile.name}</p>
                                                    <p className="text-sm text-gray-400">{formatFileSize(selectedZipFile.size)}</p>
                                                </div>
                                            </div>
                                            <label htmlFor="zip-upload-change" className="px-3 py-1 text-sm bg-gray-600 text-gray-200 rounded hover:bg-gray-500 cursor-pointer">
                                                Change
                                            </label>
                                            <input
                                                type="file"
                                                accept=".zip,.rar"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                id="zip-upload-change"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Exam *</label>
                                <select
                                    value={uploadExamId}
                                    onChange={(e) => setUploadExamId(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select an exam</option>
                                    {examList.map((exam) => (
                                        <option key={exam.id} value={exam.id}>{exam.examCode}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-700 bg-gray-900 flex justify-end space-x-3">
                            <Button variant="outline" onClick={handleCloseUploadModal} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                                Cancel
                            </Button>
                            <Button onClick={handleUploadSubmission} disabled={!selectedZipFile || !uploadExamId} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Progress Bar */}
            {uploadBatchId && (
                <div className="fixed bottom-4 right-4 z-50 w-full max-w-md">
                    <Card className="p-6 bg-gray-800 border-gray-700 shadow-2xl">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {uploadCompleted ? (
                                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                                    ) : uploadError ? (
                                        <AlertCircle className="h-6 w-6 text-red-500" />
                                    ) : (
                                        <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-gray-100">
                                            {uploadCompleted ? 'Processing Completed' : uploadError ? 'Upload Failed' : uploadStage || 'Uploading...'}
                                        </h3>
                                        <p className="text-sm text-gray-400">{uploadMessage || 'Processing...'}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleCloseUploadProgress} className="text-gray-400 hover:text-gray-200 h-8 w-8 p-0">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {!uploadCompleted && !uploadError && (
                                <div className="space-y-2">
                                    <Progress value={uploadProgress} className="h-2" />
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span className="truncate max-w-[250px]">{uploadMessage || 'Processing...'}</span>
                                        <span className="ml-2 flex-shrink-0">{uploadProgress}%</span>
                                    </div>
                                </div>
                            )}

                            {uploadError && (
                                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                                    <p className="text-sm text-red-300">{uploadError}</p>
                                </div>
                            )}

                            {uploadCompleted && (
                                <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                                    <p className="text-sm text-green-300">
                                        All submissions have been successfully processed!
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {/* Auto Assign Modal */}
            {openModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-gray-100">Auto Assign Examiners</h2>
                            <p className="text-sm text-gray-400 mt-1">Select a batch and examiners</p>
                        </div>
                        
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                            <div>
                                <h3 className="font-semibold text-gray-200 mb-3">Select Batch</h3>
                                <div className="space-y-2">
                                    {batches.map((batchId) => (
                                        <div key={batchId} className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded">
                                            <input
                                                type="radio"
                                                id={batchId}
                                                name="batchSelection"
                                                checked={modalSelectedBatchId === batchId}
                                                onChange={() => setModalSelectedBatchId(batchId)}
                                                className="h-4 w-4 text-blue-600"
                                            />
                                            <label htmlFor={batchId} className="flex-1 cursor-pointer">
                                                <span className="font-mono text-sm text-gray-300">{batchId}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-200">Select Examiners</h3>
                                    <button onClick={handleSelectAllExaminers} className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
                                        {selectedExaminers.length === examinerList.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {examinerList.map((examiner) => (
                                        <div key={examiner.id} className="flex items-center space-x-3 p-3 hover:bg-gray-700 rounded border border-gray-600">
                                            <input
                                                type="checkbox"
                                                id={`examiner-${examiner.id}`}
                                                checked={selectedExaminers.includes(examiner.id)}
                                                onChange={() => handleExaminerSelection(examiner.id)}
                                                className="h-4 w-4 text-blue-600 rounded"
                                            />
                                            <label htmlFor={`examiner-${examiner.id}`} className="flex-1 cursor-pointer">
                                                <div className="font-medium text-gray-200">{examiner.name}</div>
                                                <div className="text-sm text-gray-400">{examiner.email}</div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-700 bg-gray-900 flex justify-end space-x-3">
                            <Button variant="outline" onClick={handleCloseModal} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                                Cancel
                            </Button>
                            <Button onClick={handleAssignMany} disabled={!modalSelectedBatchId || selectedExaminers.length === 0} className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50">
                                Assign Many
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}