'use client';

import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Administration</h2>
                <p className="text-muted-foreground">Manage system configuration and users</p>
              </div>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Add New
              </Button>
            </div>

            {/* Admin Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Subjects', description: 'Manage course subjects and codes', count: 12 },
                { title: 'Semesters', description: 'Configure academic semesters', count: 4 },
                { title: 'Users', description: 'Manage system users and roles', count: 48 },
                { title: 'Rubrics', description: 'Define grading criteria', count: 36 },
              ].map((section) => (
                <div
                  key={section.title}
                  className="rounded-lg bg-card border border-border p-6 hover:border-primary transition cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Settings className="h-6 w-6 text-primary" />
                    <span className="text-2xl font-bold text-muted-foreground">{section.count}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{section.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Manage
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
