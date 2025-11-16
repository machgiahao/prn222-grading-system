'use client';

import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { StatsCard } from '@/components/stats-card';
import { BarChart3, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
              <p className="text-muted-foreground">Welcome to the Exam Grading System</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                label="Total Submissions"
                value={324}
                change="+12% from last week"
                icon={<FileText className="h-8 w-8" />}
              />
              <StatsCard
                label="Graded"
                value={287}
                change="+18% completion"
                icon={<CheckCircle2 className="h-8 w-8" />}
              />
              <StatsCard
                label="Pending Review"
                value={37}
                change="3 overdue"
                icon={<AlertTriangle className="h-8 w-8" />}
              />
              <StatsCard
                label="Plagiarism Detected"
                value={12}
                change="3.7% of submissions"
                icon={<BarChart3 className="h-8 w-8" />}
              />
            </div>

            {/* Recent Activity Section */}
            <div className="rounded-lg bg-card border border-border p-6 mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Submissions</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-primary transition"
                  >
                    <div>
                      <p className="font-medium text-foreground">Batch {i} - PRN222</p>
                      <p className="text-sm text-muted-foreground">Submitted 2 hours ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Grading Queue */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Your Grading Queue</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">SE{180000 + i}</p>
                      <p className="text-xs text-muted-foreground">PRN222 - SU25</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                      Grade Now
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
