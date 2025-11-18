'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { DataTable } from '@/components/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export default function BatchesPage() {
  const [batches] = useState([
    {
      id: '1',
      exam: 'CS101 - Lập trình C++',
      submissions: 45,
      graded: 23,
      status: 'in_progress',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      exam: 'CS102 - Data Structures',
      submissions: 38,
      graded: 38,
      status: 'completed',
      createdAt: '2024-01-10',
    },
    {
      id: '3',
      exam: 'MATH101 - Giải tích',
      submissions: 52,
      graded: 15,
      status: 'in_progress',
      createdAt: '2024-01-18',
    },
  ]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      in_progress: 'secondary',
      completed: 'default',
      pending: 'destructive',
    };
    const labels = {
      in_progress: 'Đang xử lý',
      completed: 'Hoàn thành',
      pending: 'Chưa bắt đầu',
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const columns = [
    { key: 'exam', label: 'Bài thi' },
    { key: 'submissions', label: 'Tổng bài' },
    {
      key: 'progress',
      label: 'Tiến độ',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-muted rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{
                width: `${(row.graded / row.submissions) * 100}%`,
              }}
            />
          </div>
          <span className="text-sm font-medium">
            {row.graded}/{row.submissions}
          </span>
        </div>
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
        <Button variant="ghost" size="sm">
          <ChevronRight size={16} />
        </Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý lô bài nộp</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý lô bài nộp, phân công giám khảo, và theo dõi tiến độ
          </p>
        </div>

        <DataTable
          columns={columns}
          data={batches}
          searchPlaceholder="Tìm kiếm bài thi..."
        />
      </div>
    </MainLayout>
  );
}
