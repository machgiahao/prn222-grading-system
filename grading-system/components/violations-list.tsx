'use client';

import { AlertTriangle } from 'lucide-react';

interface Violation {
  id: string;
  detectedFileName: string;
  ruleViolated: string;
}

interface ViolationsListProps {
  violations: Violation[];
}

export function ViolationsList({ violations }: ViolationsListProps) {
  if (violations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No violations detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {violations.map((violation) => (
        <div
          key={violation.id}
          className="flex gap-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
        >
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-mono text-sm text-destructive font-medium">{violation.detectedFileName}</p>
            <p className="text-sm text-destructive/80 mt-1">{violation.ruleViolated}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
