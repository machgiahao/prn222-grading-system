'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function ModerationQueuePage() {
  const [submissions] = useState([
    {
      id: '1',
      studentCode: 'SV001',
      exam: 'CS101',
      reason: 'Từ khóa cấm',
      score: 5.5,
      status: 'flagged',
      grade: 0,
    },
    {
      id: '2',
      studentCode: 'SV002',
      exam: 'CS102',
      reason: 'Điểm 0 từ giám khảo',
      score: 0,
      status: 'zero_score',
      grade: 0,
    },
    {
      id: '3',
      studentCode: 'SV003',
      exam: 'MATH101',
      reason: 'Tương tự 95%',
      score: 0,
      status: 'flagged',
      grade: 0,
    },
  ]);

  const getStatusBadge = (status: string) => {
    return status === 'flagged' ? (
      <Badge variant="destructive">
        <AlertCircle size={14} />
        Vi phạm
      </Badge>
    ) : (
      <Badge variant="secondary">
        <CheckCircle size={14} />
        Điểm 0
      </Badge>
    );
  };

  const columns = [
    { key: 'studentCode', label: 'Mã SV' },
    { key: 'exam', label: 'Bài thi' },
    { key: 'reason', label: 'Lý do' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value: any) => getStatusBadge(value),
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: any) => (
        <Button variant="outline" size="sm">
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Hàng chờ xác minh</h1>
          <p className="text-muted-foreground mt-1">
            Danh sách các bài nộp cần xác minh
          </p>
        </div>

        <DataTable
          columns={columns}
          data={submissions}
          searchPlaceholder="Tìm kiếm mã sinh viên..."
        />
      </div>
    </MainLayout>
  );
}
