'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, ClipboardList, AlertCircle, Loader2, FileText, Users, Search, X, FolderArchive, Award, LogOut } from 'lucide-react';
import { AllSubmissionParameters, Examiner, GetAllExamResponse, SubmissionData, SubmissionUploadPayload } from '@/lib/types/manager';
import { autoAssign, getAllExam, getAllExaminers, getAllSubmissions, uploadSubmissions } from '@/services/managerServices';
import SubmissionsTable from '@/components/SubmissionsTable';
import { useAuth } from '@/context/auth-context';

// Status options matching StatusBadge
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

export default function ManagerDashboard() {
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

    // Data states
    const [submissionData, setSubmissionData] = useState<SubmissionData[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [batches, setBatches] = useState<string[]>([]);
    const [examinerList, setExaminerList] = useState<Examiner[]>([]);
    const [examList, setExamList] = useState<GetAllExamResponse[]>([]);
    const { logout } = useAuth();

    // Pagination state
    const [pagination, setPagination] = useState({
        pageIndex: 1,
        pageSize: 10
    });

    const fetchSubmissions = async (params: AllSubmissionParameters) => {
        setLoading(true);
        setError(null);
        try {
            if(params.pageIndex < 1) params.pageIndex = 1;
            const data = await getAllSubmissions({
                ...params,
                pageIndex: params.pageIndex - 1 // Convert to 0-based for API
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

    // Handle search and filter
    const handleSearch = () => {
        console.log('Searching with:', {
            searchTerm,
            batchId: selectedBatchId,
            status: selectedStatus,
            examId: selectedExamId,
        });
        
        // Reset to page 1 when searching
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
        
        fetchSubmissions({ 
            pageIndex: 1, 
            pageSize: pagination.pageSize,
            examId: selectedExamId || undefined,
            submissionBatchId: selectedBatchId || undefined,
            status: selectedStatus || undefined
        });
    };

    // Clear all filters
    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedBatchId('');
        setSelectedStatus('');
        setSelectedExamId('');
        setPagination(prev => ({ ...prev, pageIndex: 1 }));
        
        // Fetch without filters
        fetchSubmissions({ 
            pageIndex: 1, 
            pageSize: pagination.pageSize
        });
    };

    // Check if any filter is active
    const hasActiveFilters = searchTerm || selectedBatchId || selectedStatus || selectedExamId;

    // Handle examiner selection
    const handleExaminerSelection = (examinerId: string) => {
        setSelectedExaminers(prev => 
            prev.includes(examinerId) 
                ? prev.filter(id => id !== examinerId)
                : [...prev, examinerId]
        );
    };

    // Handle select all examiners
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
            console.log("File too large or dialog canceled");
            return;
        }
        if (file && file.name.endsWith('.zip') || file.name.endsWith('.rar')) {
            setSelectedZipFile(file);
        } else if (file) {
            alert('Please select a ZIP file');
        }
    };

    // Handle upload submission
    const handleUploadSubmission = async () => {
        if (!selectedZipFile || !uploadExamId) {
            alert('Please fill in all fields');
            return;
        }

        const payload : SubmissionUploadPayload = {
            RarFile: selectedZipFile,
            ExamId: uploadExamId,
        };

        console.log('Upload payload:', {
            fileName: payload.RarFile.name,
            fileSize: payload.RarFile.size,
            ExamId: payload.ExamId
        });

        try {
            await uploadSubmissions(payload);
            alert('Upload successful!');
            fetchSubmissions({ 
                pageIndex: pagination.pageIndex, 
                pageSize: pagination.pageSize,
                examId: selectedExamId || undefined,
                submissionBatchId: selectedBatchId || undefined,
                status: selectedStatus || undefined
            });
        } catch(err) {
            console.error("Error uploading:", err);
            alert("Error uploading. Please try again.");
        }

        // Reset and close modal
        handleCloseUploadModal();
    };

    // Handle close upload modal
    const handleCloseUploadModal = () => {
        setSelectedZipFile(null);
        setUploadExamId('');
        setOpenUploadModal(false);
    };

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Handle assign many
    const handleAssignMany = async () => {
        if (!modalSelectedBatchId || selectedExaminers.length === 0) {
            alert('Please select a batch and at least one examiner');
            return;
        }

        const payload = {
            submissionBatchId: modalSelectedBatchId,
            examinerIds: selectedExaminers
        };

        try {
            const response = await autoAssign(payload);
            if(response.message){
                alert(`Successfully assigned ${response.assignedSubmissionCount} submissions.`);
                // Refresh submissions after assignment
                fetchSubmissions({ 
                    pageIndex: pagination.pageIndex, 
                    pageSize: pagination.pageSize,
                    examId: selectedExamId || undefined,
                    submissionBatchId: selectedBatchId || undefined,
                    status: selectedStatus || undefined
                });
            }else{
                alert("Failed to assign submissions.");
            }
        } catch(err) {
            console.error("Error in auto assign:", err);
            alert("Error assigning submissions. Please try again.");
        }
        
        // Reset and close modal
        setModalSelectedBatchId('');
        setSelectedExaminers([]);
        setOpenModal(false);
    };

    // Reset modal state when closed
    const handleCloseModal = () => {
        setModalSelectedBatchId('');
        setSelectedExaminers([]);
        setOpenModal(false);
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, pageIndex: newPage }));
    };

    // Handle assign success callback
    const handleAssignSuccess = () => {
        // Refresh current page
        fetchSubmissions({ 
            pageIndex: pagination.pageIndex, 
            pageSize: pagination.pageSize,
            examId: selectedExamId || undefined,
            submissionBatchId: selectedBatchId || undefined,
            status: selectedStatus || undefined
        });
    };

    const totalViolationCount = submissionData.filter(sub => sub.status === 'Flagged').length;
    const totalBatchCount = batches.length;

    // Initial fetch
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

    const handleLogout = () => () => {
        logout();
        window.location.href = "/";
      };

    return (
        <div className="min-h-screen bg-gray-900 p-8">
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
                          className="gap-2 bg-transparent border-zinc-700 text-white hover:bg-red-600 hover:border-red-600 !text-white cursor-pointer transition-colors"
                          onClick={handleLogout()}
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

                {/* Actions */}
                <div className="grid gap-6">
                    <Card className="p-6 bg-gray-800 border-gray-700">
                        <h3 className="font-bold mb-4 text-xl text-gray-100">Upload Submission Batch</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Upload a RAR file containing student submissions to start a new grading batch.
                        </p>
                        <Button className="w-full hover:cursor-pointer" onClick={() => setOpenUploadModal(true)}>
                            <Upload size={18} className="mr-2" />
                            Upload New Batch
                        </Button>
                    </Card>
                </div>

                {/* Submissions Section */}
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-gray-100">List of Submissions</h2>
                    
                    {/* Search and Filter Section */}
                    <Card className="p-6 mb-4 bg-gray-800 border-gray-700">
                        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
                            {/* Search section - 7 columns */}
                            <div className="lg:col-span-7 space-y-4">
                                {/* Main search bar */}
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
                                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-100 cursor-pointer"
                                    >
                                        Filters {showFilters ? '▲' : '▼'}
                                    </Button>
                                    <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                                        <Search className="h-4 w-4 mr-2" />
                                        Search
                                    </Button>
                                </div>

                                {/* Filter options - shown when showFilters is true */}
                                {showFilters && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-gray-700">
                                        {/* Exam Filter */}
                                        <div>
                                            <label className="text-xs font-medium text-gray-400 mb-1 block">
                                                Exam
                                            </label>
                                            <select
                                                value={selectedExamId}
                                                onChange={(e) => setSelectedExamId(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">All Exams</option>
                                                {examList.map((exam) => (
                                                    <option key={exam.id} value={exam.id}>
                                                        {exam.examCode}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Batch ID Filter */}
                                        <div>
                                            <label className="text-xs font-medium text-gray-400 mb-1 block">
                                                Batch ID
                                            </label>
                                            <select
                                                value={selectedBatchId}
                                                onChange={(e) => setSelectedBatchId(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">All Batches</option>
                                                {batches.map((batchId) => (
                                                    <option key={batchId} value={batchId}>
                                                        {batchId}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Status Filter */}
                                        <div>
                                            <label className="text-xs font-medium text-gray-400 mb-1 block">
                                                Status
                                            </label>
                                            <select
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">All Status</option>
                                                {statusOptions.map((status) => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Active filters display */}
                                {hasActiveFilters && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-medium text-gray-400">Active filters:</span>
                                        {searchTerm && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/50 text-blue-300 border border-blue-700 rounded text-xs">
                                                Examiner: {searchTerm}
                                                <X className="h-3 w-3 cursor-pointer hover:text-blue-100" onClick={() => setSearchTerm('')} />
                                            </span>
                                        )}
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
                                        <button
                                            onClick={handleClearFilters}
                                            className="text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Auto Assign Button - 3 columns */}
                            <div className="lg:col-span-3 flex items-start">
                                <Button
                                    onClick={() => setOpenModal(true)}
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    Auto Assign Examiners
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Submissions Table */}
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

            {openUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-gray-100">Upload Submission Batch</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Upload a ZIP file with exam details to create a new submission batch
                            </p>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* File Upload Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    ZIP File *
                                </label>
                                {!selectedZipFile ? (
                                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                                        <Upload className="mx-auto h-12 w-12 text-gray-500 mb-3" />
                                        <p className="text-gray-400 mb-2">Tải file ZIP</p>
                                        <input
                                            type="file"
                                            multiple={false}
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="zip-upload"
                                        />
                                        <label
                                            htmlFor="zip-upload"
                                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                                        >
                                            Chọn file
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
                                            <label
                                                htmlFor="zip-upload-change"
                                                className="px-3 py-1 text-sm bg-gray-600 text-gray-200 rounded hover:bg-gray-500 cursor-pointer"
                                            >
                                                Chọn lại
                                            </label>
                                            <input
                                                type="file"
                                                accept=".zip"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                id="zip-upload-change"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Exam Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Exam *
                                </label>
                                <select
                                    value={uploadExamId}
                                    onChange={(e) => setUploadExamId(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select an exam</option>
                                    {examList.map((exam) => (
                                        <option key={exam.id} value={exam.id}>
                                            {exam.examCode}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-700 bg-gray-900 flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={handleCloseUploadModal}
                                className="border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUploadSubmission}
                                disabled={!selectedZipFile || !uploadExamId}
                                className="bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Auto Assign Modal - Dark Theme */}
            {openModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-gray-100">Auto Assign Examiners</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Select a batch and examiners to assign submissions
                            </p>
                        </div>
                        
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                            {/* Batch Selection */}
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

                            {/* Examiners Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-200">Select Examiners</h3>
                                    <button
                                        onClick={handleSelectAllExaminers}
                                        className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
                                    >
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
                            <Button
                                className="hover:cursor-pointer border-gray-600 text-gray-300 hover:bg-gray-700"
                                variant="outline"
                                onClick={handleCloseModal}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAssignMany}
                                disabled={!modalSelectedBatchId || selectedExaminers.length === 0}
                                className="bg-amber-600 hover:bg-amber-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Assign Many
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}