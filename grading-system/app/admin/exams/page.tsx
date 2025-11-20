"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function ExamsPage() {
  const [exams, setExams] = useState([
    {
      id: "1",
      code: "CS101",
      name: "Lập trình C++",
      subject: "Công nghệ thông tin",
    },
    {
      id: "2",
      code: "CS102",
      name: "Data Structures",
      subject: "Công nghệ thông tin",
    },
    { id: "3", code: "MATH101", name: "Giải tích", subject: "Toán" },
  ]);
  const [setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ code: "", name: "", subject: "" });

  const handleAdd = () => {
    if (formData.code && formData.name) {
      setExams([...exams, { id: String(Date.now()), ...formData }]);
      setFormData({ code: "", name: "", subject: "" });
    }
  };

  const handleDelete = (id: string) => {
    setExams(exams.filter((e) => e.id !== id));
  };

  const columns = [
    { key: "code", label: "Mã bài thi" },
    { key: "name", label: "Tên bài thi" },
    { key: "subject", label: "Môn học" },
    {
      key: "actions",
      label: "Hành động",
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingId(row.id);
              setFormData(row);
            }}
          >
            <Edit2 size={16} />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quản lý bài thi</h1>
          <FormDialog
            title="Thêm bài thi mới"
            description="Nhập thông tin chi tiết bài thi"
            trigger={
              <Button>
                <Plus size={18} />
                Thêm mới
              </Button>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Mã bài thi</label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="VD: CS101"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tên bài thi</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="VD: Lập trình C++"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Môn học</label>
                <Input
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="VD: Công nghệ thông tin"
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                Thêm bài thi
              </Button>
            </div>
          </FormDialog>
        </div>

        <DataTable
          columns={columns}
          data={exams}
          searchPlaceholder="Tìm kiếm bài thi..."
        />
      </div>
    </MainLayout>
  );
}
