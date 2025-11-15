'use client';

import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { SubmissionList } from '@/components/submission-list';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default function BatchDetailsPage({ params }: { params: { id: string } }) {
  const batchId = params.id;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <Link href="/submissions">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-foreground">Batch {batchId}</h2>
                <p className="text-muted-foreground">PRN222 - SU25</p>
              </div>
              <Button className="gap-2" variant="outline">
                <Download className="h-4 w-4" />
                Download Original
              </Button>
            </div>

            {/* Batch Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="rounded-lg bg-card border border-border p-6">
                <p className="text-muted-foreground text-sm mb-2">Total Submissions</p>
                <p className="text-3xl font-bold text-foreground">45</p>
              </div>
              <div className="rounded-lg bg-card border border-border p-6">
                <p className="text-muted-foreground text-sm mb-2">Processed</p>
                <p className="text-3xl font-bold text-green-500">42</p>
              </div>
              <div className="rounded-lg bg-card border border-border p-6">
                <p className="text-muted-foreground text-sm mb-2">With Violations</p>
                <p className="text-3xl font-bold text-destructive">3</p>
              </div>
              <div className="rounded-lg bg-card border border-border p-6">
                <p className="text-muted-foreground text-sm mb-2">Status</p>
                <p className="text-lg font-bold text-accent">Processed</p>
              </div>
            </div>

            {/* Submissions List */}
            <div className="rounded-lg bg-card border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Submissions</h3>
              <SubmissionList batchId={batchId} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
