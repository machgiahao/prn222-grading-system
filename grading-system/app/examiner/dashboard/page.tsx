'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';

export default function ExaminerDashboard() {
  const stats = [
    { label: 'Chờ chấm', value: '12', icon: Clock, color: 'bg-yellow-500' },
    { label: 'Đã chấm', value: '28', icon: CheckSquare, color: 'bg-green-500' },
    { label: 'Chờ xem xét', value: '2', icon: AlertCircle, color: 'bg-red-500' },
  ];

  const recentTasks = [
    {
      id: 1,
      studentCode: 'SV001',
      exam: 'CS101',
      status: 'pending',
      daysAgo: 2,
    },
    {
      id: 2,
      studentCode: 'SV002',
      exam: 'CS102',
      status: 'pending',
      daysAgo: 1,
    },
    {
      id: 3,
      studentCode: 'SV003',
      exam: 'MATH101',
      status: 'completed',
      daysAgo: 0,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bảng điều khiển</h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan về khối lượng công việc chấm điểm
          </p>
        </div>

        {/* Stats Grid */}
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

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Hoạt động gần đây</h2>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm">{task.studentCode}</p>
                  <p className="text-xs text-muted-foreground">{task.exam}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {task.daysAgo === 0 ? 'Hôm nay' : `${task.daysAgo} ngày trước`}
                  </span>
                  <Badge variant={task.status === 'pending' ? 'secondary' : 'default'}>
                    {task.status === 'pending' ? 'Chờ chấm' : 'Đã chấm'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
