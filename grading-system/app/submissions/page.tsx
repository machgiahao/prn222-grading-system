'use client';

import { Sidebar } from '@/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Search, Upload, Filter } from 'lucide-react';

export default function SubmissionsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Submissions</h2>
              <p className="text-muted-foreground">Manage exam submissions and batches</p>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search submissions..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button className="gap-2" variant="outline">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Upload className="h-4 w-4" />
                Upload Batch
              </Button>
            </div>

            {/* Submissions Table */}
            <div className="rounded-lg bg-card border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Batch ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Subject</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Semester</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Count</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Uploaded</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b border-border hover:bg-background/50 transition">
                        <td className="px-6 py-4 text-sm text-foreground font-medium">BATCH{i.toString().padStart(4, '0')}</td>
                        <td className="px-6 py-4 text-sm text-foreground">PRN222</td>
                        <td className="px-6 py-4 text-sm text-foreground">SU25</td>
                        <td className="px-6 py-4 text-sm text-foreground">{45 + i * 5}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            i % 3 === 0 ? 'bg-accent/20 text-accent' : 
                            i % 3 === 1 ? 'bg-primary/20 text-primary' : 
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {i % 3 === 0 ? 'Pending' : i % 3 === 1 ? 'Processing' : 'Processed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{i} days ago</td>
                        <td className="px-6 py-4 text-sm">
                          <Button variant="ghost" size="sm" className="text-primary">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
