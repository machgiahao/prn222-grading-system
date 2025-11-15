'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { AnalyticsCards } from '@/components/analytics-cards';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  stats: {
    totalSubmissions: number;
    gradedSubmissions: number;
    pendingGrading: number;
    plagiarismDetected: number;
    violationsFound: number;
    totalExaminers: number;
    averageGrade: number;
    completionRate: number;
  };
  bySubject: Array<{ subject: string; submissions: number; graded: number }>;
  byStatus: Array<{ status: string; count: number; percentage: number }>;
}

const CHART_COLORS = ['oklch(0.55 0.22 263.9)', 'oklch(0.65 0.22 263.9)', 'oklch(0.7 0.22 29.2)'];

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics');
        const data = await res.json();
        setAnalytics(data);
      } catch (error) {
        console.error('[v0] Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h2>
              <p className="text-muted-foreground">System overview and analytics</p>
            </div>

            {isLoading || !analytics ? (
              <div className="text-foreground">Loading analytics...</div>
            ) : (
              <>
                {/* Analytics Cards */}
                <AnalyticsCards stats={analytics.stats} />

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  {/* Submissions by Subject */}
                  <div className="rounded-lg bg-card border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Submissions by Subject</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.bySubject}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="subject" stroke="var(--color-muted-foreground)" />
                        <YAxis stroke="var(--color-muted-foreground)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-background)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="submissions" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="graded" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Status Distribution */}
                  <div className="rounded-lg bg-card border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Grading Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.byStatus}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {analytics.byStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-background)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="rounded-lg bg-card border border-border p-6">
                    <p className="text-muted-foreground text-sm mb-2">Average Grade</p>
                    <p className="text-4xl font-bold text-primary">{analytics.stats.averageGrade}</p>
                    <p className="text-xs text-muted-foreground mt-2">out of 10</p>
                  </div>
                  <div className="rounded-lg bg-card border border-border p-6">
                    <p className="text-muted-foreground text-sm mb-2">Active Examiners</p>
                    <p className="text-4xl font-bold text-accent">{analytics.stats.totalExaminers}</p>
                    <p className="text-xs text-muted-foreground mt-2">grading submissions</p>
                  </div>
                  <div className="rounded-lg bg-card border border-border p-6">
                    <p className="text-muted-foreground text-sm mb-2">Pending Review</p>
                    <p className="text-4xl font-bold text-destructive">{analytics.stats.pendingGrading}</p>
                    <p className="text-xs text-muted-foreground mt-2">submissions</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
