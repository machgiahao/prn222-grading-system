"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card } from "@/components/ui/card";
import { BarChart3, BookOpen, Users, CheckSquare } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Exams", value: "12", icon: BookOpen, color: "bg-blue-500" },
    { label: "Rubrics", value: "8", icon: CheckSquare, color: "bg-green-500" },
    { label: "Users", value: "45", icon: Users, color: "bg-purple-500" },
    { label: "Reports", value: "15", icon: BarChart3, color: "bg-orange-500" },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage the entire exam grading system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg text-white`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Quick Start Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">📚 Exam Management</h3>
              <p className="text-muted-foreground">
                Create, update, and delete exams with forbidden keywords
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">📋 Rubric Templates</h3>
              <p className="text-muted-foreground">
                Manage grading criteria and rubric templates
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">⚙️ System Configuration</h3>
              <p className="text-muted-foreground">
                Manage subjects, semesters, and users
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">📊 Reports</h3>
              <p className="text-muted-foreground">
                Approve results and export Excel reports
              </p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
