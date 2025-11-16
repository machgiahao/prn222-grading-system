'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface Submission {
  id: string;
  studentIdentifier: string;
  processingStatus: 'PendingCheck' | 'Checked';
  violations: number;
}

interface SubmissionListProps {
  batchId: string;
}

export function SubmissionList({ batchId }: SubmissionListProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`/api/submissions?batchId=${batchId}`);
        const data = await res.json();
        setSubmissions(data.submissions);
      } catch (error) {
        console.error('[v0] Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [batchId]);

  if (isLoading) {
    return <div className="text-foreground">Loading submissions...</div>;
  }

  return (
    <div className="space-y-3">
      {submissions.map((submission) => (
        <div
          key={submission.id}
          className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-primary transition"
        >
          <div className="flex items-center gap-4 flex-1">
            <div>
              <p className="font-mono font-medium text-foreground">{submission.studentIdentifier}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Status: {submission.processingStatus === 'Checked' ? 'Processed' : 'Pending'}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {submission.violations > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-destructive/20 text-destructive text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  {submission.violations} violations
                </div>
              )}
              {submission.processingStatus === 'Checked' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="ml-4 text-primary">
            View
          </Button>
        </div>
      ))}
    </div>
  );
}
