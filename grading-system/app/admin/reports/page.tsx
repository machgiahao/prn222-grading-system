'use client';

import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { DataTable } from '@/components/data-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllSubmissions, exportReport, approveSubmission } from '@/services/adminService';
import { AllSubmissionParameters } from '@/lib/types/manager';
import { useToast } from '@/components/ui/use-toast';

export default function ReportsPage() {
  const [submission, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    totalPages: 0,
    totalRecords: 0,
  });
  const { toast } = useToast();

  // Get unique submission batch IDs
  const uniqueBatchIds = useMemo(() => {
    const batchMap = new Map();
    submission.forEach((item) => {
      if (item.submissionBatchId && !batchMap.has(item.submissionBatchId)) {
        batchMap.set(item.submissionBatchId, {
          id: item.submissionBatchId,
          examName: item.exam?.name || item.examCode || 'N/A',
          status: item.status,
        });
      }
    });
    return Array.from(batchMap.values());
  }, [submission]);

  // Fetch submissions data
  const fetchSubmissions = async (params?: Partial<AllSubmissionParameters>) => {
    setLoading(true);
    try {
      const response = await getAllSubmissions({
        pageIndex: params?.pageIndex || pagination.pageIndex,
        pageSize: params?.pageSize || pagination.pageSize,
        ...params,
      });

      setSubmissions(response.data || []);
      setPagination({
        pageIndex: response.pageIndex,
        pageSize: response.pageSize,
        totalPages: Math.ceil(response.count / response.pageSize),
        totalRecords: response.count,
      });
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load report data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Export report from dialog
  const handleExportFromDialog = async () => {
    if (!selectedBatchId) {
      toast({
        title: 'Error',
        description: 'Please select a batch to export',
        variant: 'destructive',
      });
      return;
    }

    setExportingId(selectedBatchId);
    try {
      toast({
        title: 'Processing',
        description: 'Generating Excel file...',
      });

      const blob = await exportReport(selectedBatchId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${selectedBatchId}_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Excel file downloaded successfully',
      });

      // Close dialog after successful export
      setShowExportDialog(false);
      setSelectedBatchId('');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive',
      });
    } finally {
      setExportingId(null);
    }
  };

  // Export report to Excel (from table)
  const handleExport = async (batchId: string) => {
    setExportingId(batchId);
    try {
      toast({
        title: 'Processing',
        description: 'Generating Excel file...',
      });

      const blob = await exportReport(batchId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${batchId}_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Excel file downloaded successfully',
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive',
      });
    } finally {
      setExportingId(null);
    }
  };

  // Approve submission batch
  const handleApprove = async (submissionId: string) => {
    setApprovingId(submissionId);
    try {
      await approveSubmission(submissionId);
      
      toast({
        title: 'Success',
        description: 'Submission approved successfully',
      });

      // Refresh data after approval
      fetchSubmissions();
    } catch (error) {
      console.error('Error approving submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve submission',
        variant: 'destructive',
      });
    } finally {
      setApprovingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: any }> = {
      completed: {
        label: 'Approved',
        className: 'bg-green-600',
        icon: CheckCircle,
      },
      pending: {
        label: 'Pending Approval',
        className: 'bg-yellow-600',
        icon: AlertCircle,
      },
      grading: {
        label: 'Grading',
        className: 'bg-blue-600',
        icon: AlertCircle,
      },
    };

    const config = statusMap[status] || statusMap['pending'];
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon size={14} className="mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Calculate summary statistics
  const stats = {
    total: submission.length,
    approved: submission.filter(b => b.status.toLowerCase() === 'completed').length,
    pending: submission.filter(b => b.status.toLowerCase() === 'pending').length,
  };

  const columns = [
    {
      key: 'submissionBatchId',
      label: 'Batch ID',
      render: (value: any) => (
        <span className="font-mono text-sm text-muted-foreground">
          {value || 'N/A'}
        </span>
      ),
    },
    { 
      key: 'exam', 
      label: 'Exam',
      render: (_: any, row: any) => row.exam?.name || row.examCode || 'N/A'
    },
    {
      key: 'stats',
      label: 'Grading Progress',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-muted rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{
                width: `${row.totalSubmissions > 0 ? (row.gradedSubmissions / row.totalSubmissions) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="text-sm font-medium">
            {row.gradedSubmissions || 0}/{row.totalSubmissions || 0}
          </span>
        </div>
      ),
    },
    {
      key: 'violationCount',
      label: 'Violations',
      render: (value: any) => (
        <Badge variant={value > 0 ? 'destructive' : 'secondary'}>
          {value || 0} violation{value !== 1 ? 's' : ''}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any) => getStatusBadge(value),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport(row.id)}
            disabled={exportingId === row.id}
          >
            {exportingId === row.id ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            <span className="ml-1">Excel</span>
          </Button> */}
          {row.status === 'pending' && (
            <Button
              size="sm"
              onClick={() => handleApprove(row.id)}
              disabled={approvingId === row.id}
            >
              {approvingId === row.id ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : null}
              Approve
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reports & Approval</h1>
            <p className="text-muted-foreground mt-1">
              View reports, approve results and export data
            </p>
          </div>
          <Button onClick={() => setShowExportDialog(true)} className="gap-2">
            <Download size={18} />
            Export to Excel
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total Exams</p>
            <p className="text-3xl font-bold mt-2">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-3xl font-bold mt-2 text-green-600">{stats.approved}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Pending Approval</p>
            <p className="text-3xl font-bold mt-2 text-yellow-600">{stats.pending}</p>
          </Card>
        </div>

        {/* Batches Table */}
        <DataTable
          columns={columns}
          data={submission}
          title="Grading Results"
          searchPlaceholder="Search exams..."
        />

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Export Report to Excel</DialogTitle>
              <DialogDescription>
                Select a submission batch to export the grading report
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Submission Batch</label>
                <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a batch..." />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueBatchIds.length === 0 ? (
                      <SelectItem value="no-data" disabled>
                        No batches available
                      </SelectItem>
                    ) : (
                      uniqueBatchIds.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          <div className="flex items-center justify-between w-full gap-4">
                            <div className="flex flex-col">
                              <span className="font-mono text-sm font-medium">
                                {batch.id}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {batch.examName}
                              </span>
                            </div>
                            {getStatusBadge(batch.status)}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedBatchId && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium mb-1">Selected Batch:</p>
                  <p className="font-mono text-xs">{selectedBatchId}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowExportDialog(false);
                  setSelectedBatchId('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExportFromDialog}
                disabled={!selectedBatchId || exportingId === selectedBatchId}
              >
                {exportingId === selectedBatchId ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" />
                    Export
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}