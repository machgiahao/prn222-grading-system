"use client";

import { useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  CheckSquare,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export function Sidebar() {
  const { userTokenData } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = {
    Admin: [
      { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
      { href: "/admin/exams", label: "Exam Management", icon: BookOpen },
      { href: "/admin/rubrics", label: "Rubric Management", icon: FileText },
      { href: "/admin/config", label: "System Configuration", icon: Users },
      { href: "/admin/reports", label: "Reports & Approval", icon: BarChart3 },
    ],
    Manager: [
      { href: "/manager/dashboard", label: "Dashboard", icon: BarChart3 },
      {
        href: "/manager/batches",
        label: "Batch Management",
        icon: ClipboardList,
      },
      {
        href: "/manager/violations",
        label: "Violation Handling",
        icon: AlertCircle,
      },
    ],
    Examiner: [
      { href: "/examiner/tasks", label: "My Tasks", icon: CheckSquare },
      { href: "/examiner/grading", label: "Grading", icon: FileText },
    ],
    Moderator: [
      {
        href: "/moderator/queue",
        label: "Verification Queue",
        icon: CheckSquare,
      },
    ],
  };

  type Role = keyof typeof menuItems;

  const key = userTokenData?.name as Role | undefined;
  const items = (key && menuItems[key]) || [];

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-40"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } z-30`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-sidebar-border">
            <h1 className="text-xl font-bold">GradingHub</h1>
            <p className="text-sm text-sidebar-foreground/70 mt-1 capitalize">
              {userTokenData?.email}
            </p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {items.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={18} />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
