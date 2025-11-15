'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Trash2, Edit2, Plus } from 'lucide-react';

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  createdAt: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        setUsers(data.users);
      } catch (error) {
        console.error('[v0] Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return <div className="text-foreground">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">System Users</h3>
        <Button size="sm" className="gap-2 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Username</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Roles</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Joined</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-background/50 transition">
                <td className="px-6 py-4 text-sm font-medium text-foreground">{user.fullName}</td>
                <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{user.username}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{user.createdAt}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-foreground mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={selectedUser.fullName}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={selectedUser.email}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
