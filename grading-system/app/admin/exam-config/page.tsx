'use client';

import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { ExamManagement } from '@/components/exam-management';

export default function ExamConfigPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Exam Configuration</h2>
              <p className="text-muted-foreground">Manage subjects, semesters, and grading rubrics</p>
            </div>

            <ExamManagement />
          </div>
        </main>
      </div>
    </div>
  );
}
