'use client';

import { BarChart3, FileText, Zap, Users, Settings } from 'lucide-react';
import Link from 'next/link';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    label: 'Submissions',
    href: '/submissions',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: 'Grading',
    href: '/grading',
    icon: <Zap className="h-4 w-4" />,
  },
  {
    label: 'Plagiarism Check',
    href: '/plagiarism',
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: <Settings className="h-4 w-4" />,
  },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-sidebar">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded bg-sidebar-primary"></div>
          <span className="font-bold text-sidebar-foreground">ExamGrade</span>
        </div>

        <nav className="space-y-2">
          {SIDEBAR_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition"
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
