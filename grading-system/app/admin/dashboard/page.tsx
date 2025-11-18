'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { BarChart3, BookOpen, Users, CheckSquare } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Tổng bài thi', value: '12', icon: BookOpen, color: 'bg-blue-500' },
    { label: 'Phiếu chấm', value: '8', icon: CheckSquare, color: 'bg-green-500' },
    { label: 'Người dùng', value: '45', icon: Users, color: 'bg-purple-500' },
    { label: 'Báo cáo', value: '15', icon: BarChart3, color: 'bg-orange-500' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý toàn bộ hệ thống chấm điểm
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Hướng dẫn nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">📚 Quản lý bài thi</h3>
              <p className="text-muted-foreground">
                Tạo, cập nhật, xóa các bài thi và định nghĩa từ khóa cấm
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">📋 Phiếu chấm</h3>
              <p className="text-muted-foreground">
                Quản lý tiêu chí chấm điểm và mẫu phiếu chấm
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">⚙️ Cấu hình hệ thống</h3>
              <p className="text-muted-foreground">
                Quản lý môn học, học kỳ, và người dùng
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">📊 Báo cáo</h3>
              <p className="text-muted-foreground">
                Phê duyệt kết quả và xuất báo cáo Excel
              </p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
