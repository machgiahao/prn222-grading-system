"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card } from "@/components/ui/card";
import { getAllExam, getALlRubrics, getAllUserAccounts } from "@/services/adminService";
import { BarChart3, BookOpen, Users, CheckSquare } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [countExam, setCountExam] = useState(0);
  const [countRubrics, setCountRubrics] = useState(0);
  const [countUsers, setCountUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAllExams = async () => {
    try {
      const response = await getAllExam();
      setCountExam(response.length);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  }

  const fetchAllRubrics = async () => {
    try{
      const response = await getALlRubrics();
      setCountRubrics(response.length);
    }catch(err){
      console.error('Error fetching rubrics:', err);
    }
  }

  const fetchAllUsers = async () => {
    try{
      const reponse = await getAllUserAccounts({pageIndex: 0, pageSize: 9999});
      setCountUsers(reponse.count);
      setLoading(false);
    }catch(err){
      console.error('Error fetching Users:', err);
    }
  }

  useEffect(() => {
    fetchAllExams();
    fetchAllRubrics();
    fetchAllUsers();
  }, [])

  const stats = [
    { label: "Total Exams", value: countExam, icon: BookOpen, color: "bg-blue-500" },
    { label: "Rubrics", value: countRubrics, icon: CheckSquare, color: "bg-green-500" },
    { label: "Users", value: countUsers, icon: Users, color: "bg-purple-500" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
