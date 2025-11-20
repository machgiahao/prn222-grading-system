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
import {
  createSubject,
  deleteSubject,
  getSubjects,
  updateSubject,
} from "@/services/adminService";
import { Subject } from "@/lib/types/admin";

export default function SubjectPage() {
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subjectCode: "",
    subjectName: "",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load subjects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSubjects();
        setSubjects(data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load subjects",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const resetForm = () => {
    setFormData({ subjectCode: "", subjectName: "" });
    setEditingId(null);
  };

  // CREATE
  const handleAddSubject = async () => {
    try {
      const created = await createSubject(formData);
      const data = await getSubjects();
      setSubjects(data);

      toast({
        title: "Success",
        description: "Subject created successfully",
      });

      resetForm();
      setIsDialogOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to create subject",
        variant: "destructive",
      });
    }
  };

  // OPEN EDIT
  const handleEditSubject = (subject: Subject) => {
    setFormData({
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
    });
    setEditingId(subject.id);
    setIsDialogOpen(true);
  };

  // UPDATE
  const handleUpdateSubject = async () => {
    if (!editingId) return;

    try {
      const updated = await updateSubject(editingId, formData);
      const data = await getSubjects();
      setSubjects(data);

      toast({
        title: "Updated",
        description: "Subject updated successfully",
      });

      resetForm();
      setIsDialogOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update subject",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await deleteSubject(id);
      const data = await getSubjects();
      setSubjects(data);
      
      toast({
        title: "Deleted",
        description: "Subject deleted successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = () => {
    if (editingId) handleUpdateSubject();
    else handleAddSubject();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Subject Management</h1>
            <p className="text-muted-foreground mt-2">
              Create, edit, and manage academic subjects
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus size={18} />
            Add Subject
          </Button>
        </div>

        {/* Dialog */}
        <FormDialog
          title={editingId ? "Edit Subject" : "Add New Subject"}
          opened={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          trigger={<></>}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Subject Code</label>
              <Input
                value={formData.subjectCode}
                onChange={(e) =>
                  setFormData({ ...formData, subjectCode: e.target.value })
                }
                placeholder="e.g., MTH101"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Subject Name</label>
              <Input
                value={formData.subjectName}
                onChange={(e) =>
                  setFormData({ ...formData, subjectName: e.target.value })
                }
                placeholder="e.g., Calculus I"
              />
            </div>

            <Button onClick={handleSubmit} className="w-full">
              {editingId ? "Update Subject" : "Add Subject"}
            </Button>
          </div>
        </FormDialog>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Subject Code</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    Loading subjects...
                  </TableCell>
                </TableRow>
              ) : subjects.length > 0 ? (
                subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>{subject.id}</TableCell>
                    <TableCell>{subject.subjectCode}</TableCell>
                    <TableCell>{subject.subjectName}</TableCell>

                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSubject(subject)}
                        >
                          <Edit2 size={16} />
                          Edit
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSubject(subject.id)}
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
                    No subjects found. Create one to get started.
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
