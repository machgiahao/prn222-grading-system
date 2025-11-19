'use client';

import { Button } from '@/components/ui/button';
import { Award, ChevronRight, Search, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

// Import type và service
import { MyTask } from '@/lib/types/common';
import { getMyTasks } from '@/services/examinerServices';
import { useAuth } from '@/context/auth-context';

export default function TasksPage() {
  const [taskList, setTaskList] = useState<MyTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<MyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { logout } = useAuth();

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyTasks();
      setTaskList(data);
      setFilteredTasks(data);
    } catch (err: any) {
      console.error("Failed to fetch tasks:", err);
      setError("Unable to load the task list. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTasks(taskList);
    } else {
      const filtered = taskList.filter(task =>
        task.studentCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTasks(filtered);
    }
  }, [searchQuery, taskList]);

  const handleLogout = () => () => {
    logout();
    window.location.href = '/';
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  const remainingTasks = filteredTasks.length;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-xl font-bold text-white">Grading System</h1>
                <p className="text-sm text-gray-400">Examiner Portal</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="gap-2 bg-transparent border-zinc-700 text-white hover:bg-red-600 hover:border-red-600 !text-white cursor-pointer transition-colors"
              onClick={handleLogout()}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Task List</h1>
          <p className="text-gray-400">Review and grade student submissions</p>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-1">Remain in queue</p>
              <p className="text-5xl font-bold text-blue-500">{taskList.length}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Submissions</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Student Code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-400">
              Found {remainingTasks} result{remainingTasks !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Task List */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Award className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-white">
              Your Grading Queue ({remainingTasks} items)
            </h2>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchQuery 
                  ? `No submissions found matching "${searchQuery}"`
                  : "No submissions have been assigned to you"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-all bg-black"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-1">
                        Student Code: {task.studentCode}
                      </p>
                      <p className="text-sm text-gray-400 mb-2">
                        Batch ID: {task.submissionBatchId}
                      </p>
                      <span className="inline-block px-3 py-1 bg-yellow-900/30 text-yellow-500 text-xs font-medium rounded-full border border-yellow-900/50">
                        {task.status}
                      </span>
                    </div>
                    <Button
                      onClick={() => {
                        window.location.href = `/examiner/${task.id}`;
                      }}
                      className="ml-4 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    >
                      Grade
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}