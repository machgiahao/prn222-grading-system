'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { DataTable } from '@/components/data-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';

export default function ReportsPage() {
  const [batches] = useState([
    {
      id: '1',
      exam: 'CS101 - Lập trình C++',
      totalSubmissions: 45,
      gradedSubmissions: 45,
      violationCount: 2,
      status: 'completed',
      completedDate: '2024-01-20',
    },
    {
      id: '2',
      exam: 'CS102 - Data Structures',
      totalSubmissions: 38,
      gradedSubmissions: 38,
      violationCount: 0,
      status: 'completed',
      completedDate: '2024-01-18',
    },
    {
      id: '3',
      exam: 'MATH101 - Giải tích',
      totalSubmissions: 52,
      gradedSubmissions: 47,
      violationCount: 5,
      status: 'pending_approval',
      completedDate: '2024-01-21',
    },
  ]);

  const getStatusBadge = (status: string) => {
    return status === 'completed' ? (
      <Badge className="bg-green-600">
        <CheckCircle size={14} />
        Đã phê duyệt
      </Badge>
    ) : (
      <Badge variant="secondary">
        <AlertCircle size={14} />
        Chờ phê duyệt
      </Badge>
    );
  };

  const handleExport = (batchId: string) => {
    console.log('Exporting batch:', batchId);
    alert('Đang tải file Excel...');
  };

  const handleApprove = (batchId: string) => {
    console.log('Approving batch:', batchId);
    alert('Đã phê duyệt kết quả!');
  };

  const columns = [
    { key: 'exam', label: 'Bài thi' },
    {
      key: 'stats',
      label: 'Tiến độ chấm',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-muted rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{
                width: `${(row.gradedSubmissions / row.totalSubmissions) * 100}%`,
              }}
            />
          </div>
          <span className="text-sm font-medium">
            {row.gradedSubmissions}/{row.totalSubmissions}
          </span>
        </div>
      ),
    },
    {
      key: 'violationCount',
      label: 'Vi phạm',
      render: (value: any) => (
        <Badge variant={value > 0 ? 'destructive' : 'secondary'}>
          {value} vi phạm
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value: any) => getStatusBadge(value),
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport(row.id)}
          >
            <Download size={16} />
            Excel
          </Button>
          {row.status === 'pending_approval' && (
            <Button
              size="sm"
              onClick={() => handleApprove(row.id)}
            >
              Phê duyệt
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Báo cáo & Phê duyệt</h1>
          <p className="text-muted-foreground mt-1">
            Xem báo cáo, phê duyệt kết quả và xuất dữ liệu
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Tổng bài thi</p>
            <p className="text-3xl font-bold mt-2">3</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Đã phê duyệt</p>
            <p className="text-3xl font-bold mt-2">2</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Chờ phê duyệt</p>
            <p className="text-3xl font-bold mt-2">1</p>
          </Card>
        </div>

        {/* Batches Table */}
        <DataTable
          columns={columns}
          data={batches}
          title="Kết quả chấm điểm"
          searchPlaceholder="Tìm kiếm bài thi..."
        />
      </div>
    </MainLayout>
  );
}
