'use client';

import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { UserManagement } from '@/components/user-management';
import { Users } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-3xl font-bold text-foreground">User Management</h2>
                <p className="text-muted-foreground">Create and manage system users and roles</p>
              </div>
            </div>

            <div className="rounded-lg bg-card border border-border p-6">
              <UserManagement />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
