'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { FormDialog } from '@/components/form-dialog';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface RubricItem {
  id: string;
  criteria: string;
  maxScore: number;
}

interface Rubric {
  id: string;
  name: string;
  exam: string;
  items: RubricItem[];
  totalScore: number;
}

export default function RubricsPage() {
  const [rubrics, setRubrics] = useState<Rubric[]>([
    {
      id: '1',
      name: 'Phiếu chấm CS101',
      exam: 'CS101 - Lập trình C++',
      items: [
        { id: '1-1', criteria: 'Cấu trúc code', maxScore: 2.0 },
        { id: '1-2', criteria: 'Tính đúng đắn', maxScore: 3.0 },
        { id: '1-3', criteria: 'Hiệu suất', maxScore: 2.0 },
        { id: '1-4', criteria: 'Tài liệu', maxScore: 1.0 },
      ],
      totalScore: 8.0,
    },
    {
      id: '2',
      name: 'Phiếu chấm CS102',
      exam: 'CS102 - Data Structures',
      items: [
        { id: '2-1', criteria: 'Complexity', maxScore: 3.0 },
        { id: '2-2', criteria: 'Implementation', maxScore: 4.0 },
      ],
      totalScore: 7.0,
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    exam: '',
    items: [] as RubricItem[],
  });
  const [newItem, setNewItem] = useState({ criteria: '', maxScore: 1.0 });

  const handleAddRubric = () => {
    if (formData.name && formData.exam && formData.items.length > 0) {
      const totalScore = formData.items.reduce(
        (sum, item) => sum + item.maxScore,
        0
      );
      const newRubric: Rubric = {
        id: String(Date.now()),
        name: formData.name,
        exam: formData.exam,
        items: formData.items,
        totalScore,
      };
      setRubrics([...rubrics, newRubric]);
      setFormData({ name: '', exam: '', items: [] });
      setNewItem({ criteria: '', maxScore: 1.0 });
    }
  };

  const handleDeleteRubric = (id: string) => {
    setRubrics(rubrics.filter((r) => r.id !== id));
  };

  const handleAddItem = () => {
    if (newItem.criteria) {
      setFormData({
        ...formData,
        items: [...formData.items, { id: String(Date.now()), ...newItem }],
      });
      setNewItem({ criteria: '', maxScore: 1.0 });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== itemId),
    });
  };

  const columns = [
    { key: 'name', label: 'Tên phiếu chấm' },
    { key: 'exam', label: 'Bài thi' },
    {
      key: 'totalScore',
      label: 'Tổng điểm',
      render: (value: any) => <span className="font-semibold">{value}</span>,
    },
    {
      key: 'items',
      label: 'Mục chấm',
      render: (_: any, row: Rubric) => (
        <span className="text-sm text-muted-foreground">
          {row.items.length} tiêu chí
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (_: any, row: Rubric) => (
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <ChevronRight size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{row.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Chi tiết mục chấm</h3>
                  <div className="space-y-2">
                    {row.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-2 bg-muted rounded"
                      >
                        <span>{item.criteria}</span>
                        <span className="font-semibold">{item.maxScore}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right text-lg font-bold pt-2 border-t">
                  Tổng: {row.totalScore}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteRubric(row.id)}
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
          <h1 className="text-2xl font-bold">Quản lý phiếu chấm</h1>
          <FormDialog
            title="Tạo phiếu chấm mới"
            trigger={
              <Button>
                <Plus size={18} />
                Thêm mới
              </Button>
            }
          >
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="text-sm font-medium">Tên phiếu chấm</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="VD: Phiếu chấm CS101"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Bài thi</label>
                <Input
                  value={formData.exam}
                  onChange={(e) =>
                    setFormData({ ...formData, exam: e.target.value })
                  }
                  placeholder="VD: CS101 - Lập trình C++"
                />
              </div>

              <div>
                <h3 className="font-semibold mb-2">Mục chấm điểm</h3>
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {formData.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-2 bg-muted rounded"
                    >
                      <span className="text-sm">{item.criteria}</span>
                      <div className="flex gap-2">
                        <span className="text-sm font-semibold">
                          {item.maxScore}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 p-3 bg-muted rounded">
                  <Input
                    value={newItem.criteria}
                    onChange={(e) =>
                      setNewItem({ ...newItem, criteria: e.target.value })
                    }
                    placeholder="Tiêu chí chấm điểm"
                  />
                  <Input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newItem.maxScore}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        maxScore: parseFloat(e.target.value),
                      })
                    }
                    placeholder="Điểm tối đa"
                  />
                  <Button
                    onClick={handleAddItem}
                    className="w-full"
                    size="sm"
                    variant="outline"
                  >
                    + Thêm mục
                  </Button>
                </div>
              </div>

              <Button onClick={handleAddRubric} className="w-full">
                Tạo phiếu chấm
              </Button>
            </div>
          </FormDialog>
        </div>

        <DataTable
          columns={columns}
          data={rubrics}
          searchPlaceholder="Tìm kiếm phiếu chấm..."
        />
      </div>
    </MainLayout>
  );
}
