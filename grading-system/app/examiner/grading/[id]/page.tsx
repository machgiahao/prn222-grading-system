'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default function GradingPage({ params }: { params: { id: string } }) {
  const [scores, setScores] = useState({
    criteria1: 0,
    criteria2: 0,
    criteria3: 0,
    criteria4: 0,
  });
  const [comment, setComment] = useState('');

  const rubricItems = [
    { id: 'criteria1', name: 'Cấu trúc code', maxScore: 2.0 },
    { id: 'criteria2', name: 'Tính đúng đắn', maxScore: 3.0 },
    { id: 'criteria3', name: 'Hiệu suất', maxScore: 2.0 },
    { id: 'criteria4', name: 'Tài liệu code', maxScore: 1.0 },
  ];

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxTotal = rubricItems.reduce((a, b) => a + b.maxScore, 0);

  const handleSubmit = () => {
    console.log('Submit grades:', { scores, comment, totalScore });
    alert('Điểm đã được nộp thành công!');
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/examiner/tasks">
            <Button variant="outline" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Chấm điểm bài nộp</h1>
            <p className="text-muted-foreground">Sinh viên: SV001 - CS101</p>
          </div>
        </div>

        {/* Student Info */}
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Mã sinh viên</p>
              <p className="font-semibold">SV001</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bài thi</p>
              <p className="font-semibold">CS101</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ngày nộp</p>
              <p className="font-semibold">2024-01-15</p>
            </div>
            <div>
              <Button variant="outline" size="sm" className="w-full">
                <Download size={16} />
                Tải file
              </Button>
            </div>
          </div>
        </Card>

        {/* Grading Rubric */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Phiếu chấm điểm</h2>
          <div className="space-y-4">
            {rubricItems.map((item) => (
              <div
                key={item.id}
                className="flex items-end gap-4 p-4 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <label className="text-sm font-medium">{item.name}</label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Điểm tối đa: {item.maxScore}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max={item.maxScore}
                    step="0.5"
                    value={scores[item.id as keyof typeof scores] || ''}
                    onChange={(e) =>
                      setScores({
                        ...scores,
                        [item.id]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-20"
                  />
                  <span className="text-sm font-medium">/ {item.maxScore}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Total Score */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg flex justify-between items-center">
            <span className="font-bold text-lg">Tổng điểm</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
              {totalScore} / {maxTotal}
            </span>
          </div>
        </Card>

        {/* Comments */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Nhận xét</h2>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Nhập nhận xét chi tiết..."
            className="min-h-24"
          />
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            onClick={handleSubmit}
            className="flex-1"
            size="lg"
          >
            Nộp điểm
          </Button>
          <Link href="/examiner/tasks" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              Hủy
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
