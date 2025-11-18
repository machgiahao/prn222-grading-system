'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormDialog } from '@/components/form-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function ConfigPage() {
  const [subjects, setSubjects] = useState([
    { id: '1', name: 'Công nghệ thông tin', code: 'IT' },
    { id: '2', name: 'Toán', code: 'MATH' },
    { id: '3', name: 'Vật lý', code: 'PHYSICS' },
  ]);

  const [semesters, setSemesters] = useState([
    { id: '1', name: 'Học kỳ I 2023-2024', code: 'HK1-2023' },
    { id: '2', name: 'Học kỳ II 2023-2024', code: 'HK2-2023' },
  ]);

  const [formDataSubject, setFormDataSubject] = useState({
    name: '',
    code: '',
  });

  const [formDataSemester, setFormDataSemester] = useState({
    name: '',
    code: '',
  });

  const handleAddSubject = () => {
    if (formDataSubject.name && formDataSubject.code) {
      setSubjects([
        ...subjects,
        { id: String(Date.now()), ...formDataSubject },
      ]);
      setFormDataSubject({ name: '', code: '' });
    }
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const handleAddSemester = () => {
    if (formDataSemester.name && formDataSemester.code) {
      setSemesters([
        ...semesters,
        { id: String(Date.now()), ...formDataSemester },
      ]);
      setFormDataSemester({ name: '', code: '' });
    }
  };

  const handleDeleteSemester = (id: string) => {
    setSemesters(semesters.filter((s) => s.id !== id));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Cấu hình hệ thống</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý môn học, học kỳ và cấu hình chung
          </p>
        </div>

        <Tabs defaultValue="subjects" className="w-full">
          <TabsList>
            <TabsTrigger value="subjects">Môn học</TabsTrigger>
            <TabsTrigger value="semesters">Học kỳ</TabsTrigger>
          </TabsList>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Danh sách môn học</h2>
              <FormDialog
                title="Thêm môn học"
                trigger={
                  <Button size="sm">
                    <Plus size={16} />
                    Thêm mới
                  </Button>
                }
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Tên môn học</label>
                    <Input
                      value={formDataSubject.name}
                      onChange={(e) =>
                        setFormDataSubject({
                          ...formDataSubject,
                          name: e.target.value,
                        })
                      }
                      placeholder="VD: Lập trình C++"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Mã môn</label>
                    <Input
                      value={formDataSubject.code}
                      onChange={(e) =>
                        setFormDataSubject({
                          ...formDataSubject,
                          code: e.target.value,
                        })
                      }
                      placeholder="VD: CS101"
                    />
                  </div>
                  <Button onClick={handleAddSubject} className="w-full">
                    Thêm môn học
                  </Button>
                </div>
              </FormDialog>
            </div>

            <div className="space-y-2">
              {subjects.map((subject) => (
                <Card key={subject.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{subject.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Mã: {subject.code}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSubject(subject.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Semesters Tab */}
          <TabsContent value="semesters" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Danh sách học kỳ</h2>
              <FormDialog
                title="Thêm học kỳ"
                trigger={
                  <Button size="sm">
                    <Plus size={16} />
                    Thêm mới
                  </Button>
                }
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Tên học kỳ</label>
                    <Input
                      value={formDataSemester.name}
                      onChange={(e) =>
                        setFormDataSemester({
                          ...formDataSemester,
                          name: e.target.value,
                        })
                      }
                      placeholder="VD: Học kỳ I 2024-2025"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Mã học kỳ</label>
                    <Input
                      value={formDataSemester.code}
                      onChange={(e) =>
                        setFormDataSemester({
                          ...formDataSemester,
                          code: e.target.value,
                        })
                      }
                      placeholder="VD: HK1-2024"
                    />
                  </div>
                  <Button onClick={handleAddSemester} className="w-full">
                    Thêm học kỳ
                  </Button>
                </div>
              </FormDialog>
            </div>

            <div className="space-y-2">
              {semesters.map((semester) => (
                <Card
                  key={semester.id}
                  className="p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{semester.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Mã: {semester.code}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSemester(semester.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
