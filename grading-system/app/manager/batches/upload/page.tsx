'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, UploadIcon } from 'lucide-react';
import Link from 'next/link';

export default function UploadBatchPage() {
  const [selectedExam, setSelectedExam] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const exams = [
    { id: '1', code: 'CS101', name: 'Lập trình C++' },
    { id: '2', code: 'CS102', name: 'Data Structures' },
    { id: '3', code: 'MATH101', name: 'Giải tích' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!selectedExam || !fileName) {
      alert('Vui lòng chọn bài thi và file');
      return;
    }

    setIsUploading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert('Upload thành công!');
      setSelectedExam('');
      setFileName('');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/manager/batches">
            <Button variant="outline" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Upload lô bài mới</h1>
            <p className="text-muted-foreground">
              Tải lên file .rar chứa bài nộp của sinh viên
            </p>
          </div>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            {/* Exam Selection */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Chọn bài thi *
              </label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn bài thi..." />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.code} - {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Chọn file .rar *
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".rar,.zip"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  <UploadIcon size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">
                    Kéo file vào đây hoặc nhấp để chọn
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Chỉ hỗ trợ .rar hoặc .zip
                  </p>
                </label>
                {fileName && (
                  <p className="text-sm font-semibold text-green-600 mt-3">
                    ✓ {fileName}
                  </p>
                )}
              </div>
            </div>

            {/* Info */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <p className="text-sm">
                <span className="font-semibold">Lưu ý:</span> File .rar phải chứa
                các thư mục với tên là mã sinh viên. Mỗi thư mục chứa file code
                của sinh viên đó.
              </p>
            </Card>

            {/* Upload Button */}
            <div className="flex gap-4">
              <Button
                onClick={handleUpload}
                disabled={isUploading || !selectedExam || !fileName}
                className="flex-1"
                size="lg"
              >
                {isUploading ? 'Đang upload...' : 'Upload'}
              </Button>
              <Link href="/manager/batches" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  Hủy
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
