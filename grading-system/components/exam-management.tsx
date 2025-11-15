'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface Subject {
  id: string;
  subjectCode: string;
  subjectName: string;
}

interface Semester {
  id: string;
  semesterCode: string;
  semesterName: string;
}

interface Rubric {
  id: string;
  criterionName: string;
  maxPoints: number;
  order: number;
}

export function ExamManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, semestersRes] = await Promise.all([
          fetch('/api/subjects'),
          fetch('/api/semesters'),
        ]);

        const subjectsData = await subjectsRes.json();
        const semestersData = await semestersRes.json();

        setSubjects(subjectsData.subjects);
        setSemesters(semestersData.semesters);

        if (subjectsData.subjects.length > 0 && semestersData.semesters.length > 0) {
          setSelectedSubject(subjectsData.subjects[0].id);
          setSelectedSemester(semestersData.semesters[0].id);
        }
      } catch (error) {
        console.error('[v0] Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSubject && selectedSemester) {
      const fetchRubrics = async () => {
        try {
          const res = await fetch(
            `/api/rubrics?subjectId=${selectedSubject}&semesterId=${selectedSemester}`
          );
          const data = await res.json();
          setRubrics(data.rubrics);
        } catch (error) {
          console.error('[v0] Rubrics fetch error:', error);
        }
      };

      fetchRubrics();
    }
  }, [selectedSubject, selectedSemester]);

  if (isLoading) {
    return <div className="text-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Subjects Section */}
      <div className="rounded-lg bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Subjects</h3>
          <Button size="sm" className="gap-2 bg-primary text-primary-foreground">
            <Plus className="h-4 w-4" />
            Add Subject
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="p-4 rounded-lg bg-background border border-border hover:border-primary transition cursor-pointer"
              onClick={() => setSelectedSubject(subject.id)}
            >
              <p className="font-mono text-sm text-accent">{subject.subjectCode}</p>
              <p className="font-medium text-foreground mt-1">{subject.subjectName}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Semesters Section */}
      <div className="rounded-lg bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Semesters</h3>
          <Button size="sm" className="gap-2 bg-primary text-primary-foreground">
            <Plus className="h-4 w-4" />
            Add Semester
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {semesters.map((semester) => (
            <div
              key={semester.id}
              className="p-4 rounded-lg bg-background border border-border hover:border-primary transition cursor-pointer"
              onClick={() => setSelectedSemester(semester.id)}
            >
              <p className="font-mono text-sm text-accent">{semester.semesterCode}</p>
              <p className="font-medium text-foreground mt-1">{semester.semesterName}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rubrics Section */}
      <div className="rounded-lg bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Grading Rubrics - {subjects.find((s) => s.id === selectedSubject)?.subjectCode} / {semesters.find((s) => s.id === selectedSemester)?.semesterCode}
          </h3>
          <Button size="sm" className="gap-2 bg-primary text-primary-foreground">
            <Plus className="h-4 w-4" />
            Add Rubric
          </Button>
        </div>

        <div className="space-y-3">
          {rubrics.map((rubric) => (
            <div
              key={rubric.id}
              className="flex items-center justify-between p-4 rounded-lg bg-background border border-border"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">{rubric.criterionName}</p>
                <p className="text-sm text-muted-foreground">Max Points: {rubric.maxPoints}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
