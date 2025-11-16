'use client';

interface AnalyticsCardsProps {
  stats: {
    totalSubmissions: number;
    gradedSubmissions: number;
    pendingGrading: number;
    plagiarismDetected: number;
    violationsFound: number;
    averageGrade: number;
    completionRate: number;
  };
}

export function AnalyticsCards({ stats }: AnalyticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="rounded-lg bg-card border border-border p-6">
        <p className="text-muted-foreground text-sm mb-2">Total Submissions</p>
        <p className="text-3xl font-bold text-foreground">{stats.totalSubmissions}</p>
        <p className="text-xs text-muted-foreground mt-2">All semesters</p>
      </div>

      <div className="rounded-lg bg-card border border-border p-6">
        <p className="text-muted-foreground text-sm mb-2">Graded</p>
        <p className="text-3xl font-bold text-green-500">{stats.gradedSubmissions}</p>
        <p className="text-xs text-muted-foreground mt-2">{stats.completionRate}% complete</p>
      </div>

      <div className="rounded-lg bg-card border border-border p-6">
        <p className="text-muted-foreground text-sm mb-2">Plagiarism Detected</p>
        <p className="text-3xl font-bold text-destructive">{stats.plagiarismDetected}</p>
        <p className="text-xs text-muted-foreground mt-2">{((stats.plagiarismDetected / stats.totalSubmissions) * 100).toFixed(1)}% of total</p>
      </div>

      <div className="rounded-lg bg-card border border-border p-6">
        <p className="text-muted-foreground text-sm mb-2">Violations Found</p>
        <p className="text-3xl font-bold text-accent">{stats.violationsFound}</p>
        <p className="text-xs text-muted-foreground mt-2">File naming & format</p>
      </div>
    </div>
  );
}
