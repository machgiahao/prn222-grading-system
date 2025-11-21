export interface Semester {
  id: string;
  semesterCode: string;
  semesterName: string;
}

export interface Subject {
  id: string;
  subjectCode: string;
  subjectName: string;
}

export interface RubricItem {
  id: string;
  criteria: string;
  maxScore: number;
  rubricId: string;
}

export interface AllRubricReponse {
  id: string;
  examId: string;
  items: RubricItem[];
}

export type GetAllUsersResponse = {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: UserItem[];
};
export type UserItem = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string; // hoặc Date nếu bạn parse
};

export interface GetAllUserParameters {
    pageIndex: number;
    pageSize: number;
    roleName?: string;
}

export type CreateExamRequest = {
  examCode: string;
  forbiddenKeywords: string[];
  subjectId: string;
  semesterId: string;
};

export type UpdateExamRequest = {
  id: string;
  examCode: string;
  forbiddenKeywords: string[];
};

export type CreateRubric = {
  examId: string;
}


// Dữ liệu để update rubric
export type UpdateRubrics = {
  id: string;
  examId: string;
};
