'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function ViolationsPage() {
  const [violations] = useState([
    {
      id: '1',
      studentCode: 'SV001',
      exam: 'CS101',
      type: 'forbidden_keyword',
      description: 'Từ khóa cấm: "plagiarism"',
      occurrences: 3,
      status: 'pending',
      reportedDate: '2024-01-20',
    },
    {
      id: '2',
      studentCode: 'SV002',
      exam: 'CS102',
      type: 'similarity',
      description: 'Tương tự 95% với SV005',
      occurrences: 1,
      status: 'verified',
      reportedDate: '2024-01-19',
    },
    {
      id: '3',
      studentCode: 'SV003',
      exam: 'MATH101',
      type: 'forbidden_keyword',
      description: 'Từ khóa cấm: "copied"',
      occurrences: 2,
      status: 'resolved',
      reportedDate: '2024-01-18',
    },
  ]);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      forbidden_keyword: 'Từ khóa cấm',
      similarity: 'Tương tự cao',
      plagiarism: 'Nghi ngờ sao chép',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive'
    > = {
      pending: 'secondary',
      verified: 'destructive',
      resolved: 'default',
    };

    const labels: Record<string, string> = {
      pending: 'Chờ xử lý',
      verified: 'Đã xác nhận',
      resolved: 'Đã giải quyết',
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status] || status}
      </Badge>
    );
  };

  const columns = [
    { key: 'studentCode', label: 'Mã SV' },
    { key: 'exam', label: 'Bài thi' },
    {
      key: 'type',
      label: 'Loại vi phạm',
      render: (value: any) => (
        <span className="text-sm">{getTypeLabel(value)}</span>
      ),
    },
    { key: 'description', label: 'Mô tả' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value: any) => getStatusBadge(value),
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: any) => (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Chi tiết
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chi tiết vi phạm</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Mã sinh viên</p>
                <p className="font-semibold">{row.studentCode}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bài thi</p>
                <p className="font-semibold">{row.exam}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Loại vi phạm</p>
                <p className="font-semibold">{getTypeLabel(row.type)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Chi tiết</p>
                <p className="font-semibold">{row.description}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Số lần xuất hiện</p>
                <p className="font-semibold">{row.occurrences}</p>
              </div>
              <Card className="p-4 bg-yellow-50 dark:bg-yellow-950">
                <p className="text-sm">
                  Bài nộp này cần được xem xét bởi Moderator trước khi chấm điểm
                  cuối cùng.
                </p>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Xử lý vi phạm</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các vi phạm phát hiện được (từ khóa cấm, tương tự cao, v.v)
          </p>
        </div>

        <DataTable
          columns={columns}
          data={violations}
          searchPlaceholder="Tìm kiếm mã sinh viên..."
        />
      </div>
    </MainLayout>
  );
}
