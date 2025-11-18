'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, ClipboardList, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ManagerDashboard() {
  const stats = [
    { label: 'Lô bài nộp', value: '5', icon: ClipboardList, color: 'bg-blue-500' },
    { label: 'Bài nộp', value: '127', icon: Upload, color: 'bg-green-500' },
    { label: 'Vi phạm', value: '8', icon: AlertCircle, color: 'bg-red-500' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý lô bài nộp và phân công giám khảo
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg text-white`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-bold mb-4">📤 Upload bài nộp</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload file RAR chứa bài nộp của sinh viên
            </p>
            <Link href="/manager/batches/upload">
              <Button className="w-full">
                <Upload size={18} />
                Upload mới
              </Button>
            </Link>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4">📋 Quản lý lô bài</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Phân công giám khảo và theo dõi tiến độ
            </p>
            <Link href="/manager/batches">
              <Button className="w-full" variant="outline">
                <ClipboardList size={18} />
                Xem danh sách
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
