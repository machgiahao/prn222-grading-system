'use client';

import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Award, ChevronRight } from 'lucide-react';

export default function GradingPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Grading Dashboard</h2>
              <p className="text-muted-foreground">Review and grade student submissions</p>
            </div>

            {/* Grading Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="rounded-lg bg-card border border-border p-6">
                <p className="text-muted-foreground text-sm mb-2">Assigned to You</p>
                <p className="text-4xl font-bold text-primary">23</p>
                <p className="text-xs text-muted-foreground mt-2">Active assignments</p>
              </div>
              <div className="rounded-lg bg-card border border-border p-6">
                <p className="text-muted-foreground text-sm mb-2">Completed</p>
                <p className="text-4xl font-bold text-green-500">156</p>
                <p className="text-xs text-muted-foreground mt-2">This semester</p>
              </div>
              <div className="rounded-lg bg-card border border-border p-6">
                <p className="text-muted-foreground text-sm mb-2">Average Score</p>
                <p className="text-4xl font-bold text-accent">7.8</p>
                <p className="text-xs text-muted-foreground mt-2">/10</p>
              </div>
            </div>

            {/* Current Assignments */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Your Grading Queue
              </h3>

              <div className="space-y-4">
                {[
                  { id: 'SE181001', course: 'PRN222', semester: 'SU25', maxScore: 10, priority: 'High' },
                  { id: 'SE181002', course: 'PRN222', semester: 'SU25', maxScore: 10, priority: 'Medium' },
                  { id: 'SE181003', course: 'PRN222', semester: 'SU25', maxScore: 10, priority: 'Low' },
                  { id: 'SE181004', course: 'PRN222', semester: 'SU25', maxScore: 10, priority: 'High' },
                ].map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-primary transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-semibold text-foreground">{assignment.id}</p>
                          <p className="text-sm text-muted-foreground">{assignment.course} - {assignment.semester}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            assignment.priority === 'High' ? 'bg-destructive/20 text-destructive' :
                            assignment.priority === 'Medium' ? 'bg-accent/20 text-accent' :
                            'bg-muted/20 text-muted-foreground'
                          }`}>
                            {assignment.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                      Grade
                      <ChevronRight className="h-4 w-4" />
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
