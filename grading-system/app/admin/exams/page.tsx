"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2 } from "lucide-react";

import {
  createExam,
  deleteExam,
  updateExam,
  getAllExam,
  getSemesters,
  getSubjects
} from "@/services/adminService";  

import {
  CreateExamRequest,
  UpdateExamRequest
} from "@/lib/types/admin"; 

import {
  GetAllExamResponse
} from "@/lib/types/manager";

export default function ExamsPage() {
  const [exams, setExams] = useState<GetAllExamResponse[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<{id: string, subjectName: string}[]>([]);
  const [semesters, setSemesters] = useState<{id: string, semesterName: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    examCode: "",
    forbiddenKeywords: "",
    subjectId: "",
    semesterId: "",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // -----------------------------------------------------
  // Load exams, subjects, semesters from backend
  // -----------------------------------------------------
  const fetchExams = async () => {
    try {
      const res = await getAllExam();
      setExams(res);
    } catch (err) {
      console.error("Cannot load exams:", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await getSubjects();
      setSubjects(res.map(s => ({ id: s.id, subjectName: s.subjectName })));
    } catch (err) {
      console.error("Cannot load subjects:", err);
    }
  };

  const fetchSemesters = async () => {
    try {
      const res = await getSemesters();
      setSemesters(res.map(s => ({ id: s.id, semesterName: s.semesterName })));
    } catch (err) {
      console.error("Cannot load semesters:", err);
    }
  };

  

  useEffect(() => {
    fetchExams();
    fetchSubjects();
    fetchSemesters();
  }, []);

  // -----------------------------------------------------
  // Add exam
  // -----------------------------------------------------
  const handleAdd = async () => {
    setLoading(true);
    const body: CreateExamRequest = {
      examCode: formData.examCode,
      forbiddenKeywords: formData.forbiddenKeywords.split(",").map(x => x.trim()),
      subjectId: formData.subjectId,
      semesterId: formData.semesterId,
    };

    try {
      await createExam(body);
      await fetchExams();
      setFormData({ examCode: "", forbiddenKeywords: "", subjectId: "", semesterId: "" });
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Create exam failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // Update exam
  // -----------------------------------------------------
  const handleUpdate = async () => {
    if (!editingId) return;
    setLoading(true);

    const body: UpdateExamRequest = {
      id: editingId,
      examCode: formData.examCode,
      forbiddenKeywords: formData.forbiddenKeywords.split(",").map(x => x.trim()),
    };

    try {
      await updateExam(editingId, body);
      await fetchExams();
      setEditingId(null);
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Update exam failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // Delete exam
  // -----------------------------------------------------
  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteExam(id);
      await fetchExams();
    } catch (err) {
      console.error("Delete exam failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "examCode", label: "Exam Code" },
    { key: "subjectName", label: "Subject" },
    { key: "semesterName", label: "Semester" },
    {
      key: "forbiddenKeywords",
      label: "Forbidden Keywords",
      render: (_: any, row: any) => row.forbiddenKeywords.join(", ")
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          {/* UPDATE */}
          <FormDialog
            title="Edit Exam"
            description="Update exam information"
            trigger={
              <Button variant="outline" size="sm">
                <Edit2 size={16} />
              </Button>
            }
            opened={editingId === row.id}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (open) {
                setEditingId(row.id);
                setFormData({
                  examCode: row.examCode,
                  forbiddenKeywords: row.forbiddenKeywords.join(", "),
                  subjectId: row.subjectId,
                  semesterId: row.semesterId,
                });
              }
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Exam Code</label>
                <Input
                  value={formData.examCode}
                  onChange={(e) =>
                    setFormData({ ...formData, examCode: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Forbidden Keywords</label>
                <Input
                  value={formData.forbiddenKeywords}
                  onChange={(e) =>
                    setFormData({ ...formData, forbiddenKeywords: e.target.value })
                  }
                  placeholder="keyword1, keyword2"
                  disabled={loading}
                />
              </div>
              <Button className="w-full" onClick={handleUpdate} disabled={loading}>
                {loading ? "Updating..." : "Update"}
              </Button>
            </div>
          </FormDialog>

          {/* DELETE */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(row.id)}
            disabled={loading}
          >
            {loading ? "Deleting..." : <Trash2 size={16} />}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Exam Management</h1>

          {/* ADD */}
          <FormDialog
            title="Add Exam"
            description="Enter exam information"
            trigger={
              <Button>
                <Plus size={18} />
                Add New
              </Button>
            }
            opened={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Exam Code</label>
                <Input
                  value={formData.examCode}
                  onChange={(e) =>
                    setFormData({ ...formData, examCode: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Forbidden Keywords</label>
                <Input
                  value={formData.forbiddenKeywords}
                  onChange={(e) =>
                    setFormData({ ...formData, forbiddenKeywords: e.target.value })
                  }
                  placeholder="keyword1, keyword2"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Subject</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) =>
                    setFormData({ ...formData, subjectId: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                  disabled={loading}
                >
                  <option value="">Select subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.subjectName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Semester</label>
                <select
                  value={formData.semesterId}
                  onChange={(e) =>
                    setFormData({ ...formData, semesterId: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                  disabled={loading}
                >
                  <option value="">Select semester</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>{s.semesterName}</option>
                  ))}
                </select>
              </div>

              <Button onClick={handleAdd} className="w-full" disabled={loading}>
                {loading ? "Adding..." : "Add Exam"}
              </Button>
            </div>
          </FormDialog>
        </div>

        <DataTable
          columns={columns}
          data={exams}
          searchPlaceholder="Search exams..."
        />
      </div>
    </MainLayout>
  );
}
