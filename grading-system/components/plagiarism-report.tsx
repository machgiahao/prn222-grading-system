'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { AlertTriangle, TrendingUp } from 'lucide-react';

interface PlagiarismReportItem {
  id: string;
  studentA: string;
  studentB: string;
  similarityScore: number;
  status: 'Flagged' | 'Under Review' | 'Reviewed';
}

interface PlagiarismReportProps {
  subjectId?: string;
  semesterId?: string;
}

export function PlagiarismReport({ subjectId, semesterId }: PlagiarismReportProps) {
  const [reports, setReports] = useState<PlagiarismReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [threshold, setThreshold] = useState(0.75);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const params = new URLSearchParams();
        if (subjectId) params.append('subjectId', subjectId);
        if (semesterId) params.append('semesterId', semesterId);
        params.append('threshold', threshold.toString());

        const res = await fetch(`/api/plagiarism/reports?${params}`);
        const data = await res.json();
        setReports(data.reports);
      } catch (error) {
        console.error('[v0] Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [subjectId, semesterId, threshold]);

  if (isLoading) {
    return <div className="text-foreground">Loading plagiarism reports...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Threshold Control */}
      <div className="flex items-center gap-4">
        <label htmlFor="threshold" className="text-sm font-medium text-foreground">
          Similarity Threshold:
        </label>
        <input
          id="threshold"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground font-mono">{(threshold * 100).toFixed(0)}%</span>
      </div>

      {/* Reports Table */}
      {reports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No plagiarism detected above threshold</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Student A</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Student B</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Similarity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-border hover:bg-background/50 transition">
                  <td className="px-6 py-4 text-sm font-mono text-foreground">{report.studentA}</td>
                  <td className="px-6 py-4 text-sm font-mono text-foreground">{report.studentB}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            report.similarityScore > 0.9
                              ? 'bg-destructive'
                              : report.similarityScore > 0.8
                              ? 'bg-accent'
                              : 'bg-primary'
                          }`}
                          style={{ width: `${report.similarityScore * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono text-foreground w-12 text-right">
                        {(report.similarityScore * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        report.status === 'Flagged'
                          ? 'bg-destructive/20 text-destructive'
                          : report.status === 'Under Review'
                          ? 'bg-accent/20 text-accent'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Button variant="ghost" size="sm" className="text-primary">
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
