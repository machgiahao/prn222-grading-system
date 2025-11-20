export interface SubmissionUploadPayload {
    RarFile: File;
    ExamId: string;
}

export interface UploadResponse {
    batchId: string;
}

export interface AssignPayload {
    submissionId: string;
    examinerId: string;
}
export interface AssignResponse {
    message: string;
}

export interface AutoAssignPayload {
    submissionBatchId: string;
    examinerIds: string[];
}

export interface AutoAssignResponse {
    message: string;
    assignedSubmissionCount: number;
}

export interface SubmissionData {
    id: string;
    studentCode: string;
    originalFileName: string;
    folderName: string;
    examId: string;
    examCode: string;
    submissionBatchId: string;
    status: string;
    gitHubRepositoryUrl: string;
    createdAt: string;
    examinerId: string;
    examinerName: string;
    assignedAt: string;
}

export interface AllSubmissionsResponse {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: SubmissionData[];
}

export interface AllSubmissionParameters {
    pageIndex: number;
    pageSize: number;
    examId?: string;
    submissionBatchId?: string;
    status?: string;
}

export interface GetAllExaminerParameters {
    pageIndex: number;
    pageSize: number;
    roleName?: "Examiner";
}

export interface GetAllExaminerResponse {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: Examiner[];
  }
  
  export interface Examiner {
    id: string;
    name: string;
    email: string;
    roles: string[];
    createdAt: string; 
  }
  

  export interface GetAllExamResponse {
    id: string;
    examCode: string;
    forbiddenKeywords: string[];
    subjectId: string;
    subjectName: string;
    semesterId: string;
    semesterName: string;
    rubric: Rubric;
  }
  
  export interface Rubric {
    id: string;
    examId: string;
    items: RubricItem[];
  }
  
  export interface RubricItem {
    id: string;
    criteria: string;
    maxScore: number;
    rubricId: string;
  }
  