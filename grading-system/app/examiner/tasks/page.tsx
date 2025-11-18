'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ExaminerTasksPage() {
  const [tasks] = useState([
    {
      id: '1',
      studentCode: 'SV001',
      exam: 'CS101',
      submission: 'main.cpp, helper.cpp',
      status: 'assigned',
      assignedDate: '2024-01-20',
    },
    {
      id: '2',
      studentCode: 'SV002',
      exam: 'CS101',
      submission: 'solution.cpp',
      status: 'assigned',
      assignedDate: '2024-01-20',
    },
    {
      id: '3',
      studentCode: 'SV003',
      exam: 'CS102',
      submission: 'code.cpp',
      status: 'graded',
      assignedDate: '2024-01-18',
    },
  ]);

  const getStatusColor = (status: string) => {
    return status === 'graded' ? 'default' : 'secondary';
  };

  const columns = [
    { key: 'studentCode', label: 'Mã SV' },
    { key: 'exam', label: 'Bài thi' },
    { key: 'submission', label: 'File nộp' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value: any) => (
        <Badge variant={getStatusColor(value) as any}>
          {value === 'graded' ? 'Đã chấm' : 'Chờ chấm'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: any) => (
        <Link href={`/examiner/grading/${row.id}`}>
          <Button variant="ghost" size="sm">
            <ChevronRight size={16} />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Nhiệm vụ của tôi</h1>
          <p className="text-muted-foreground mt-1">
            Danh sách các bài nộp được gán cho bạn để chấm điểm
          </p>
        </div>

        <DataTable
          columns={columns}
          data={tasks}
          searchPlaceholder="Tìm kiếm mã sinh viên..."
        />
      </div>
    </MainLayout>
  );
}
