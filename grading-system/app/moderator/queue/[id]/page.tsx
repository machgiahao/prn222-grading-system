'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Download, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function VerificationDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState<string | null>(null);

  const submission = {
    studentCode: 'SV001',
    exam: 'CS101',
    submitDate: '2024-01-15',
    fileName: 'main.cpp, helper.cpp',
    grade: 0,
  };

  const violations = [
    {
      id: 1,
      type: 'forbidden_keyword',
      keyword: 'plagiarism',
      location: 'main.cpp:line 45',
      occurrences: 3,
    },
    {
      id: 2,
      type: 'similarity',
      match: '95% match with SV005',
      location: 'helper.cpp',
      details: 'Identical function implementations',
    },
  ];

  const gradeInfo = {
    examinerName: 'Examiner 1',
    submittedDate: '2024-01-16',
    criteria: [
      { name: 'Cấu trúc', score: 0 },
      { name: 'Tính đúng đắn', score: 0 },
      { name: 'Hiệu suất', score: 0 },
      { name: 'Tài liệu', score: 0 },
    ],
    comment: 'Bài nộp có nhiều vi phạm, không thể chấm điểm',
  };

  const handleAction = (actionType: string) => {
    console.log(`Action: ${actionType}`, { notes });
    alert(`Hành động: ${actionType} đã hoàn thành`);
    setAction(actionType);
    setNotes('');
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/moderator/queue">
            <Button variant="outline" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Chi tiết xác minh</h1>
            <p className="text-muted-foreground">
              Sinh viên: {submission.studentCode} - {submission.exam}
            </p>
          </div>
        </div>

        <Tabs defaultValue="submission" className="w-full">
          <TabsList>
            <TabsTrigger value="submission">Bài nộp</TabsTrigger>
            <TabsTrigger value="violations">Vi phạm</TabsTrigger>
            <TabsTrigger value="grade">Điểm chấm</TabsTrigger>
          </TabsList>

          {/* Submission Tab */}
          <TabsContent value="submission" className="space-y-4">
            <Card className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-xs text-muted-foreground">Mã sinh viên</p>
                  <p className="font-semibold">{submission.studentCode}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bài thi</p>
                  <p className="font-semibold">{submission.exam}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ngày nộp</p>
                  <p className="font-semibold">{submission.submitDate}</p>
                </div>
                <div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download size={16} />
                    Tải file
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">File nộp</p>
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded">
                  {submission.fileName}
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Violations Tab */}
          <TabsContent value="violations" className="space-y-4">
            <div className="space-y-3">
              {violations.map((violation) => (
                <Card key={violation.id} className="p-6 border-l-4 border-l-red-500">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="text-red-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          {violation.type === 'forbidden_keyword'
                            ? 'Từ khóa cấm'
                            : 'Tương tự cao'}
                        </h3>
                        <Badge variant="destructive">Quan trọng</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {violation.type === 'forbidden_keyword'
                          ? `Từ khóa: "${violation.keyword}"`
                          : violation.match}
                      </p>
                      <p className="text-sm mb-1">
                        <span className="font-medium">Vị trí:</span> {violation.location}
                      </p>
                      {violation.type === 'similarity' && (
                        <p className="text-sm mb-1">
                          <span className="font-medium">Chi tiết:</span>{' '}
                          {violation.details}
                        </p>
                      )}
                      {violation.type === 'forbidden_keyword' && (
                        <p className="text-sm">
                          <span className="font-medium">Số lần xuất hiện:</span>{' '}
                          {violation.occurrences}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Grade Tab */}
          <TabsContent value="grade" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Giám khảo</p>
                  <p className="font-semibold">{gradeInfo.examinerName}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Chi tiết chấm</p>
                  <div className="space-y-2">
                    {gradeInfo.criteria.map((item) => (
                      <div
                        key={item.name}
                        className="flex justify-between items-center p-2 bg-muted rounded"
                      >
                        <span className="text-sm">{item.name}</span>
                        <span className="font-semibold">{item.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Nhận xét</p>
                  <p className="text-sm p-3 bg-muted rounded">
                    {gradeInfo.comment}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950">
          <h3 className="font-bold mb-4">Xử lý xác minh</h3>
          <div className="space-y-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú xác minh..."
              className="min-h-24"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={() => handleAction('approve')}
                className="bg-green-600 hover:bg-green-700"
              >
                Phê duyệt điểm 0
              </Button>
              <Button
                onClick={() => handleAction('regrading')}
                variant="outline"
              >
                Yêu cầu chấm lại
              </Button>
              <Button
                onClick={() => handleAction('reject')}
                variant="destructive"
              >
                Gửi trả Manager
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
