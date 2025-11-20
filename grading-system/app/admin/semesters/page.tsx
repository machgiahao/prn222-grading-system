"use client";

import { useEffect, useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { Semester } from "@/lib/types/admin";
import {
  createSemester,
  deleteSemester,
  getSemesters,
  updateSemester,
} from "@/services/adminService";

export default function SemesterPage() {
  const { toast } = useToast();

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    semesterCode: "",
    semesterName: "",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load semesters on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSemesters();
        setSemesters(data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load semesters",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const resetForm = () => {
    setFormData({ semesterCode: "", semesterName: "" });
    setEditingId(null);
  };

  // CREATE
  const handleAddSemester = async () => {
    try {
      await createSemester(formData);
      const data = await getSemesters();
      setSemesters(data);

      toast({
        title: "Success",
        description: "Semester created successfully",
      });

      resetForm();
      setIsDialogOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to create semester",
        variant: "destructive",
      });
    }
  };

  // OPEN EDIT DIALOG
  const handleEditSemester = (semester: Semester) => {
    setFormData({
      semesterCode: semester.semesterCode,
      semesterName: semester.semesterName,
    });
    setEditingId(semester.id);
    setIsDialogOpen(true);
  };

  // UPDATE
  const handleUpdateSemester = async () => {
    if (!editingId) return;

    try {
      await updateSemester(editingId, formData);
      const data = await getSemesters();
      setSemesters(data);

      toast({
        title: "Updated",
        description: "Semester updated successfully",
      });

      resetForm();
      setIsDialogOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update semester",
        variant: "destructive",
      });
    }
  };

  // DELETE
  const handleDeleteSemester = async (id: string) => {
    try {
      await deleteSemester(id);
      const data = await getSemesters();
      setSemesters(data);

      toast({
        title: "Deleted",
        description: "Semester deleted successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete semester",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = () => {
    if (editingId) handleUpdateSemester();
    else handleAddSemester();
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

          {/* Add Button */}
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
        </div>

        {/* Dialog */}
        <FormDialog
          title={editingId ? "Edit Semester" : "Add New Semester"}
          opened={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          trigger={<></>} // Dialog opens manually via button
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Semester Code</label>
              <Input
                value={formData.semesterCode}
                onChange={(e) =>
                  setFormData({ ...formData, semesterCode: e.target.value })
                }
                placeholder="e.g., SU 22"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Semester Name</label>
              <Input
                value={formData.semesterName}
                onChange={(e) =>
                  setFormData({ ...formData, semesterName: e.target.value })
                }
                placeholder="e.g., 22 SU 24"
              />
            </div>

            <Button onClick={handleSubmit} className="w-full">
              {editingId ? "Update Semester" : "Add Semester"}
            </Button>
          </div>
        </FormDialog>

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    Loading semesters...
                  </TableCell>
                </TableRow>
              ) : semesters.length > 0 ? (
                semesters.map((semester) => (
                  <TableRow key={semester.id}>
                    <TableCell>{semester.id}</TableCell>
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
