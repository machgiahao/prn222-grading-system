import api from "@/axios/http";
import { AllRubricReponse, CreateExamRequest, CreateRubric, GetAllUserParameters, GetAllUsersResponse, Semester, Subject, UpdateExamRequest, UpdateRubrics } from "@/lib/types/admin";
import { AllSubmissionParameters, AllSubmissionsResponse, GetAllExamResponse } from "@/lib/types/manager";

const semesterBaseUrl = "/semester";
const subjectBaseUrl = "/subject";
const reportBaseUrl = "/reports";
const userBaseUrl = "/users";
const submissionBaseUrl = "/submissions";
const examBaseUrl = "/exams";
const rubricsBaseUrl = "/rubrics";

export const getSemesters = async (): Promise<Semester[]> => {
  try {
    const response = await api.get<Semester[]>(`${semesterBaseUrl}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createSemester = async (
  data: Omit<Semester, "id">
): Promise<Semester> => {
  try {
    const response = await api.post<Semester>(`${semesterBaseUrl}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSemester = async (
  id: string,
  data: Omit<Semester, "id">
): Promise<Semester> => {
  try {
    const response = await api.put<Semester>(`${semesterBaseUrl}/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteSemester = async (id: string): Promise<void> => {
  try {
    await api.delete(`${semesterBaseUrl}/${id}`);
  } catch (error) {
    throw error;
  }
};

export const getSubjects = async (): Promise<Subject[]> => {
  try {
    const response = await api.get<Subject[]>(subjectBaseUrl);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createSubject = async (
  data: Omit<Subject, "id">
): Promise<Subject> => {
  try {
    const response = await api.post<Subject>(subjectBaseUrl, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSubject = async (
  id: string,
  data: Omit<Subject, "id">
): Promise<Subject> => {
  try {
    const response = await api.put<Subject>(`${subjectBaseUrl}/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteSubject = async (id: string): Promise<void> => {
  try {
    await api.delete(`${subjectBaseUrl}/${id}`);
  } catch (error) {
    throw error;
  }
};

export const exportReport = async (batchID: string): Promise<Blob> => {
  try{
    const response = await api.get(`${reportBaseUrl}/export/${batchID}`)
    console.log(response.data);
    return response.data;
  }catch (error) {
    throw error;
  }
}

export const approveSubmission = async (submissionID: string): Promise<void> => {
  try{
    await api.post(`${reportBaseUrl}/approve/${submissionID}`)
  }catch (error) {
    throw error;
  }
}

export const createUserAccount = async (user: any) : Promise<void> => {
  try{
    await api.post(`${userBaseUrl}`, user)
  }catch (error) {
    throw error;
  }
}

export const getAllUserAccounts = async (params: GetAllUserParameters) : Promise<GetAllUsersResponse> => {
  try{
    const pageIndex = params.pageIndex || 0;
    const pageSize = params.pageSize || 10;
    let url = "";
    if(params.roleName && params.roleName.length > 0){
      url = `${userBaseUrl}?pageIndex=${pageIndex}&pageSize=${pageSize}&roleName=${params.roleName}`;
    }else{
      url = `${userBaseUrl}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    }
    const response = await api.get(url);
    return response.data;
  }catch (error) {
    throw error;
  }
}

export const deleteUserAccount = async (userID: string) : Promise<void> => {
  try{
    await api.delete(`${userBaseUrl}/${userID}`)
  }catch (error) {
    throw error;
  }
}

export const updateUserAccount = async (userID: string, user: any) : Promise<void> => {
  try{
    await api.put(`${userBaseUrl}/${userID}`, user)
  }catch (error) {
    throw error;
  }
}

export const getAllSubmissions = async (params: AllSubmissionParameters) : Promise<AllSubmissionsResponse> => {
  try {
    const pageIndex = params.pageIndex || 0;
    const pageSize = params.pageSize || 10;
    const examId = params.examId ? `&examId=${params.examId}` : '';
    const submissionBatchId = params.submissionBatchId ? `&submissionBatchId=${params.submissionBatchId}` : '';
    const status = params.status ? `&status=${params.status}` : '';
    console.log(`${submissionBaseUrl}?pageIndex=${pageIndex}&pageSize=${pageSize}${examId}${submissionBatchId}${status}`);
    const response = await api.get(`${submissionBaseUrl}?pageIndex=${pageIndex}&pageSize=${pageSize}${examId}${submissionBatchId}${status}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const getAllExam = async () : Promise<GetAllExamResponse[]> => {
  try {
    const response = await api.get(`${examBaseUrl}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const getALlRubrics = async () : Promise<AllRubricReponse[]> => {
  try {
    const response = await api.get(`${rubricsBaseUrl}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const createExam = async (body: CreateExamRequest): Promise<void> => {
  try{
    await api.post(`${examBaseUrl}`, body);
  }catch (error) {
    throw error;
  }
}

export const deleteExam = async (id: string): Promise<void> => {
  try{
    await api.delete(`${examBaseUrl}/${id}`);
  }catch (error) {
    throw error;
  }
}

export const updateExam = async (id : string, body: UpdateExamRequest) : Promise<void> => {
  try{
    await api.put(`${examBaseUrl}/${id}`, body)
  }catch (error) {
    throw error;
  }
}

export const createRubric = async (body: CreateRubric) : Promise<void> => {
  try{
    await api.post(`${rubricsBaseUrl}`, body)
  }catch (error) {
    throw error;
  }
}

export const updateRubric = async (id : string, body: UpdateRubrics) : Promise<void> => {
  try{
    await api.put(`${rubricsBaseUrl}/${id}`, body)
  }catch (error) {
    throw error;
  }
}