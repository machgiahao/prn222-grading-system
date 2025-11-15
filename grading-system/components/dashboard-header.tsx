'use client';

import { LogOut, Settings, User } from 'lucide-react';
import { Button } from './ui/button';

export function DashboardHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary"></div>
          <h1 className="text-2xl font-bold text-foreground">ExamGrade</h1>
        </div>
        
        <nav className="flex items-center gap-6">
          <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition">
            Dashboard
          </a>
          <a href="/submissions" className="text-sm text-muted-foreground hover:text-foreground transition">
            Submissions
          </a>
          <a href="/grading" className="text-sm text-muted-foreground hover:text-foreground transition">
            Grading
          </a>
          <a href="/analytics" className="text-sm text-muted-foreground hover:text-foreground transition">
            Analytics
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
