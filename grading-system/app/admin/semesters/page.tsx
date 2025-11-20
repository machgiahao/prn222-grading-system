"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Semester {
  id: string;
  semesterCode: string;
  semesterName: string;
}

export default function SemesterPage() {
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: "1", semesterCode: "SU 22", semesterName: "22 SU 24" },
    { id: "2", semesterCode: "FA 22", semesterName: "22 FA 24" },
    { id: "3", semesterCode: "SP 23", semesterName: "23 SP 25" },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    semesterCode: "",
    semesterName: "",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const resetForm = () => {
    setFormData({ semesterCode: "", semesterName: "" });
    setEditingId(null);
  };

  const handleAddSemester = () => {
    if (formData.semesterCode && formData.semesterName) {
      setSemesters([...semesters, { id: String(Date.now()), ...formData }]);
      resetForm();
      setIsDialogOpen(false);
    }
  };

  const handleEditSemester = (semester: Semester) => {
    setFormData({
      semesterCode: semester.semesterCode,
      semesterName: semester.semesterName,
    });
    setEditingId(semester.id);
    setIsDialogOpen(true);
  };

  const handleUpdateSemester = () => {
    if (editingId && formData.semesterCode && formData.semesterName) {
      setSemesters(
        semesters.map((s) => (s.id === editingId ? { ...s, ...formData } : s))
      );
      resetForm();
      setIsDialogOpen(false);
    }
  };

  const handleDeleteSemester = (id: string) => {
    setSemesters(semesters.filter((s) => s.id !== id));
  };

  const handleSubmit = () => {
    if (editingId) {
      handleUpdateSemester();
    } else {
      handleAddSemester();
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Semester Management</h1>
            <p className="text-muted-foreground mt-2">
              Create, edit, and manage academic semesters
            </p>
          </div>
          <FormDialog
            title={editingId ? "Edit Semester" : "Add New Semester"}
            trigger={
              <Button
                size="lg"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <Plus size={18} />
                Add Semester
              </Button>
            }
            opened={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Semester Code</label>
                <Input
                  value={formData.semesterCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      semesterCode: e.target.value,
                    })
                  }
                  placeholder="e.g., SU 22"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Semester Name</label>
                <Input
                  value={formData.semesterName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      semesterName: e.target.value,
                    })
                  }
                  placeholder="e.g., 22 SU 24"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingId ? "Update Semester" : "Add Semester"}
              </Button>
            </div>
          </FormDialog>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Semester Code</TableHead>
                <TableHead>Semester Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {semesters.length > 0 ? (
                semesters.map((semester) => (
                  <TableRow key={semester.id}>
                    <TableCell className="font-medium">{semester.id}</TableCell>
                    <TableCell>{semester.semesterCode}</TableCell>
                    <TableCell>{semester.semesterName}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSemester(semester)}
                        >
                          <Edit2 size={16} />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSemester(semester.id)}
                        >
                          <Trash2 size={16} />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No semesters found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
