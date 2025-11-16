// User & Auth Types
export interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string;
}

export interface Role {
  id: string;
  name: 'Admin' | 'Manager' | 'Moderator' | 'Examiner' | 'Student';
}

// Exam Service Types
export interface Subject {
  id: string;
  subjectCode: string;
  subjectName: string;
}

export interface Semester {
  id: string;
  semesterCode: string;
  semesterName: string;
}

export interface Rubric {
  id: string;
  subjectId: string;
  semesterId: string;
  criterionName: string;
  maxPoints: number;
  order: number;
}

// Submission Service Types
export interface SubmissionBatch {
  id: string;
  subjectId: string;
  semesterId: string;
  uploadedByManagerId: string;
  originalRarPath: string;
  uploadedTimestamp: Date;
  status: 'Pending' | 'Processing' | 'Processed';
}

export interface Submission {
  id: string;
  submissionBatchId: string;
  studentIdentifier: string;
  extractedFilePath?: string;
  processingStatus: 'PendingCheck' | 'Checked';
  createdAt: Date;
}

// Violation Check Types
export interface FileNameViolation {
  id: string;
  submissionId: string;
  detectedFileName: string;
  ruleViolated: string;
}

export interface PlagiarismReport {
  id: string;
  submissionIdA: string;
  submissionIdB: string;
  similarityScore: number;
}

// Grading Service Types
export interface GradingAssignment {
  id: string;
  submissionId: string;
  examinerId: string;
  status: 'Assigned' | 'InProgress' | 'Completed' | 'Reviewed';
}

export interface GradingResult {
  id: string;
  gradingAssignmentId: string;
  totalScore: number;
  generalComment?: string;
  isViolationZero: boolean;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
  verifiedByModeratorId?: string;
  gradedTimestamp: Date;
}

export interface GradingResultItem {
  id: string;
  gradingResultId: string;
  rubricId: string;
  score: number;
  comment?: string;
}
