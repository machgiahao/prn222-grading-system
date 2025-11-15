'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { GradingForm } from '@/components/grading-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

export default function GradingAssignmentPage({ params }: { params: { id: string } }) {
  const assignmentId = params.id;
  const [rubrics, setRubrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRubrics = async () => {
      try {
        const res = await fetch('/api/rubrics?subjectId=subj-1&semesterId=sem-1');
        const data = await res.json();
        setRubrics(data.rubrics);
      } catch (error) {
        console.error('[v0] Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRubrics();
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <Link href="/grading">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-foreground">Grade Submission</h2>
                <p className="text-muted-foreground">Student: SE181001 | PRN222 - SU25</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
              {/* Grading Form */}
              <div className="col-span-2">
                <div className="rounded-lg bg-card border border-border p-6">
                  {isLoading ? (
                    <div className="text-foreground">Loading rubrics...</div>
                  ) : (
                    <GradingForm
                      assignmentId={assignmentId}
                      studentId="SE181001"
                      rubrics={rubrics}
                    />
                  )}
                </div>
              </div>

              {/* Submission Info Sidebar */}
              <div className="space-y-4">
                <div className="rounded-lg bg-card border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Submission Info</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Student ID</p>
                      <p className="font-mono text-foreground">SE181001</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Subject</p>
                      <p className="text-foreground">PRN222</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Semester</p>
                      <p className="text-foreground">SU25</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Submitted</p>
                      <p className="text-foreground">2 days ago</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-card border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Violations</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">File naming</span>
                      <span className="text-destructive font-medium">1 issue</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Plagiarism</span>
                      <span className="text-green-500 font-medium">Clear</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-card border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Submitted Files
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 rounded bg-background text-foreground font-mono text-xs truncate">
                      Main.java
                    </div>
                    <div className="p-2 rounded bg-background text-foreground font-mono text-xs truncate">
                      Controller.java
                    </div>
                    <div className="p-2 rounded bg-background text-foreground font-mono text-xs truncate">
                      View.html
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
