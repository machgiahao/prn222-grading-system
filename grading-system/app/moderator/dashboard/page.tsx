'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function ModeratorDashboard() {
  const stats = [
    {
      label: 'Chờ xác minh',
      value: '8',
      icon: Clock,
      color: 'bg-yellow-500',
    },
    { label: 'Vi phạm xác nhận', value: '5', icon: AlertCircle, color: 'bg-red-500' },
    {
      label: 'Đã phê duyệt',
      value: '23',
      icon: CheckCircle,
      color: 'bg-green-500',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bảng điều khiển</h1>
          <p className="text-muted-foreground mt-1">
            Giám sát tính công bằng và xác minh bài nộp
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

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <h3 className="font-bold mb-2">Nhiệm vụ của Moderator</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ Giám sát tính công bằng trong chấm điểm</li>
              <li>✓ Xem xét bài có vi phạm</li>
              <li>✓ Xác minh điểm 0 từ giám khảo</li>
              <li>✓ Xử lý khiếu nại từ sinh viên</li>
            </ul>
          </Card>
          <Card className="p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <h3 className="font-bold mb-2">Trạng thái xác minh</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Chờ xem xét</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between">
                <span>Đang xem xét</span>
                <span className="font-semibold">2</span>
              </div>
              <div className="flex justify-between">
                <span>Đã xác nhận</span>
                <span className="font-semibold">5</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
