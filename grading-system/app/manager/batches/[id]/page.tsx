'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function BatchDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [submissions, setSubmissions] = useState([
    {
      id: 'sub-1',
      studentCode: 'SV001',
      fileName: 'main.cpp, helper.cpp',
      status: 'ready_to_grade',
      assignedTo: null,
    },
    {
      id: 'sub-2',
      studentCode: 'SV002',
      fileName: 'solution.cpp',
      status: 'assigned',
      assignedTo: 'Examiner 1',
    },
    {
      id: 'sub-3',
      studentCode: 'SV003',
      fileName: 'code.cpp',
      status: 'flagged',
      assignedTo: null,
    },
    {
      id: 'sub-4',
      studentCode: 'SV004',
      fileName: 'implementation.cpp',
      status: 'ready_to_grade',
      assignedTo: null,
    },
  ]);

  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const examiners = [
    { id: '1', name: 'Examiner 1' },
    { id: '2', name: 'Examiner 2' },
    { id: '3', name: 'Examiner 3' },
  ];

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'destructive' }
    > = {
      ready_to_grade: {
        label: 'Chờ chấm',
        variant: 'secondary',
      },
      assigned: { label: 'Đã gán', variant: 'default' },
      flagged: { label: 'Vi phạm', variant: 'destructive' },
      graded: { label: 'Đã chấm', variant: 'default' },
    };

    const c = config[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const filtered =
    filterStatus === 'all'
      ? submissions
      : submissions.filter((s) => s.status === filterStatus);

  const handleAssign = (submissionId: string, examinerId: string) => {
    setSubmissions(
      submissions.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status: 'assigned',
              assignedTo: examiners.find((e) => e.id === examinerId)?.name,
            }
          : s
      )
    );
  };

  const handleAutoAssign = () => {
    const readyToGrade = submissions.filter((s) => s.status === 'ready_to_grade');
    let examinerIndex = 0;

    setSubmissions(
      submissions.map((s) => {
        if (s.status === 'ready_to_grade') {
          const examiner = examiners[examinerIndex % examiners.length];
          examinerIndex++;
          return { ...s, status: 'assigned', assignedTo: examiner.name };
        }
        return s;
      })
    );
  };

  const columns = [
    { key: 'studentCode', label: 'Mã SV' },
    { key: 'fileName', label: 'File nộp' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value: any) => getStatusBadge(value),
    },
    {
      key: 'assignedTo',
      label: 'Gán cho',
      render: (value: any) => (
        <span className={value ? 'font-semibold' : 'text-muted-foreground'}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (_: any, row: any) => {
        if (row.status === 'ready_to_grade') {
          return (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Gán
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gán giám khảo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Mã SV: {row.studentCode}
                  </p>
                  <Select
                    onValueChange={(value) => {
                      handleAssign(row.id, value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giám khảo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {examiners.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </DialogContent>
            </Dialog>
          );
        }

        if (row.status === 'flagged') {
          return (
            <Button variant="outline" size="sm">
              <AlertCircle size={16} />
              Chi tiết
            </Button>
          );
        }

        return null;
      },
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/manager/batches">
            <Button variant="outline" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Chi tiết lô bài</h1>
            <p className="text-muted-foreground">CS101 - Lập trình C++</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Tổng bài</p>
            <p className="text-2xl font-bold mt-1">45</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Chờ chấm</p>
            <p className="text-2xl font-bold mt-1 text-yellow-600">
              {submissions.filter((s) => s.status === 'ready_to_grade').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Đã gán</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">
              {submissions.filter((s) => s.status === 'assigned').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Vi phạm</p>
            <p className="text-2xl font-bold mt-1 text-red-600">
              {submissions.filter((s) => s.status === 'flagged').length}
            </p>
          </Card>
        </div>

        {/* Auto Assign Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Phân công tự động</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Chia bài cho giám khảo một cách tự động
              </p>
            </div>
            <Button onClick={handleAutoAssign}>
              <Users size={18} />
              Chia bài
            </Button>
          </div>
        </Card>

        {/* Submissions List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Danh sách bài nộp</h2>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="ready_to_grade">Chờ chấm</SelectItem>
                <SelectItem value="assigned">Đã gán</SelectItem>
                <SelectItem value="flagged">Vi phạm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={filtered}
            searchPlaceholder="Tìm kiếm mã sinh viên..."
          />
        </div>
      </div>
    </MainLayout>
  );
}
