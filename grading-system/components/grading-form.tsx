'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface RubricItem {
  id: string;
  criterionName: string;
  maxPoints: number;
}

interface GradingFormProps {
  assignmentId: string;
  studentId: string;
  rubrics: RubricItem[];
  onSubmit?: () => void;
}

export function GradingForm({ assignmentId, studentId, rubrics, onSubmit }: GradingFormProps) {
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [generalComment, setGeneralComment] = useState('');
  const [isViolationZero, setIsViolationZero] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const totalScore = Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);
  const maxTotal = rubrics.reduce((sum, r) => sum + r.maxPoints, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const items = rubrics.map((rubric) => ({
        rubricId: rubric.id,
        score: scores[rubric.id] || 0,
        comment: comments[rubric.id] || '',
      }));

      const response = await fetch('/api/grading-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradingAssignmentId: assignmentId,
          items,
          totalScore,
          generalComment,
          isViolationZero,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Grading saved successfully!' });
        onSubmit?.();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to save grading' });
      }
    } catch (error) {
      console.error('[v0] Submission error:', error);
      setMessage({ type: 'error', text: 'Failed to save grading' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Rubric Scoring */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Grading Criteria</h3>
        {rubrics.map((rubric) => (
          <div key={rubric.id} className="p-4 rounded-lg bg-background border border-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-medium text-foreground">{rubric.criterionName}</label>
              <span className="text-sm text-muted-foreground">Max: {rubric.maxPoints} points</span>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max={rubric.maxPoints}
                step="0.5"
                value={scores[rubric.id] || ''}
                onChange={(e) =>
                  setScores({ ...scores, [rubric.id]: parseFloat(e.target.value) || 0 })
                }
                className="w-24 px-3 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
              />
              <div className="flex-1 h-2 bg-input rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${((scores[rubric.id] || 0) / rubric.maxPoints) * 100}%` }}
                />
              </div>
            </div>

            <textarea
              value={comments[rubric.id] || ''}
              onChange={(e) =>
                setComments({ ...comments, [rubric.id]: e.target.value })
              }
              placeholder="Add comment (optional)"
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
            />
          </div>
        ))}
      </div>

      {/* Total Score */}
      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">Total Score:</span>
          <span className="text-2xl font-bold text-primary">
            {totalScore.toFixed(1)} / {maxTotal}
          </span>
        </div>
      </div>

      {/* General Comment */}
      <div>
        <label htmlFor="general" className="block text-sm font-medium text-foreground mb-2">
          General Comment
        </label>
        <textarea
          id="general"
          value={generalComment}
          onChange={(e) => setGeneralComment(e.target.value)}
          placeholder="Add overall feedback for the student..."
          className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={4}
        />
      </div>

      {/* Violation Checkbox */}
      <div className="flex items-center gap-3">
        <input
          id="violation"
          type="checkbox"
          checked={isViolationZero}
          onChange={(e) => setIsViolationZero(e.target.checked)}
          className="w-4 h-4 rounded border-border focus:ring-2 focus:ring-primary"
        />
        <label htmlFor="violation" className="text-sm text-foreground">
          Mark as violation (zero score)
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Grading'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
        >
          Save as Draft
        </Button>
      </div>
    </form>
  );
}
