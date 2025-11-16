'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BatchUploadProps {
  onUploadComplete?: () => void;
}

export function BatchUpload({ onUploadComplete }: BatchUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [subjectId, setSubjectId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.name.endsWith('.rar') || selectedFile.name.endsWith('.zip'))) {
      setFile(selectedFile);
      setMessage(null);
    } else {
      setMessage({ type: 'error', text: 'Only RAR and ZIP files are allowed' });
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !subjectId || !semesterId) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subjectId', subjectId);
      formData.append('semesterId', semesterId);

      const response = await fetch('/api/submission-batches', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Batch uploaded successfully!' });
        setFile(null);
        setSubjectId('');
        setSemesterId('');
        onUploadComplete?.();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Upload failed' });
      }
    } catch (error) {
      console.error('[v0] Upload error:', error);
      setMessage({ type: 'error', text: 'Upload failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`flex gap-3 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/20'
              : 'bg-destructive/10 border-destructive/20'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${message.type === 'success' ? 'text-green-500' : 'text-destructive'}`}>
            {message.text}
          </p>
        </div>
      )}

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
          Subject
        </label>
        <select
          id="subject"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a subject</option>
          <option value="subj-1">PRN222 - Advanced Web Development</option>
          <option value="subj-2">PRN221 - Database Design</option>
          <option value="subj-3">PRN223 - Mobile Development</option>
        </select>
      </div>

      <div>
        <label htmlFor="semester" className="block text-sm font-medium text-foreground mb-2">
          Semester
        </label>
        <select
          id="semester"
          value={semesterId}
          onChange={(e) => setSemesterId(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a semester</option>
          <option value="sem-1">SU25 - Summer 2025</option>
          <option value="sem-2">SP25 - Spring 2025</option>
          <option value="sem-3">FA24 - Fall 2024</option>
        </select>
      </div>

      <div>
        <label htmlFor="file" className="block text-sm font-medium text-foreground mb-2">
          Submission File (RAR or ZIP)
        </label>
        <div className="relative">
          <input
            id="file"
            type="file"
            accept=".rar,.zip"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="file"
            className="flex items-center justify-center w-full px-4 py-8 rounded-lg border-2 border-dashed border-border hover:border-primary transition cursor-pointer bg-background/50"
          >
            <div className="text-center">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">
                {file ? file.name : 'Click or drag to upload'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">RAR or ZIP format only</p>
            </div>
          </label>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={isLoading || !file}
      >
        {isLoading ? 'Uploading...' : 'Upload Batch'}
      </Button>
    </form>
  );
}
