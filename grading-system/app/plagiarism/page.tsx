'use client';

import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { PlagiarismReport } from '@/components/plagiarism-report';
import { AlertTriangle } from 'lucide-react';

export default function PlagiarismPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-accent" />
              <div>
                <h2 className="text-3xl font-bold text-foreground">Plagiarism Detection</h2>
                <p className="text-muted-foreground">Identify similar submissions and potential plagiarism</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="rounded-lg bg-card border border-border p-6">
                <p className="text-muted-foreground text-sm mb-2">High Similarity</p>
                <p className="text-3xl font-bold text-destructive">12</p>
                <p className="text-xs text-muted-foreground mt-2">&gt; 90% match</p>
              </div>
              <div className="rounded-lg bg-card border border-border p-6">
                <p className="text-muted-foreground text-sm mb-2">Medium Similarity</p>
                <p className="text-3xl font-bold text-accent">8</p>
                <p className="text-xs text-muted-foreground mt-2">75 - 90% match</p>
              </div>
              <div className="rounded-lg bg-card border border-border p-6">
                <p className="text-muted-foreground text-sm mb-2">Reviewed</p>
                <p className="text-3xl font-bold text-green-500">5</p>
                <p className="text-xs text-muted-foreground mt-2">False positives handled</p>
              </div>
            </div>

            {/* Plagiarism Reports */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Similarity Reports</h3>
              <PlagiarismReport />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
