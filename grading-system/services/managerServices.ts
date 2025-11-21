import api from "@/axios/http";
import { AutoAssignPayload, AssignPayload, SubmissionUploadPayload, AssignResponse, AutoAssignResponse, AllSubmissionParameters, GetAllExaminerParameters, AllSubmissionsResponse, GetAllExaminerResponse, GetAllExamResponse, UploadResponse } from "@/lib/types/manager";

const submissionBaseUrl = "/submissions";
const userBaseUrl = "/users";
const examBaseUrl = "/exams";

export const uploadSubmissions = async (formData: SubmissionUploadPayload): Promise<UploadResponse> => {
  try {
    const response = await api.post(`${submissionBaseUrl}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const assignOne = async (body: AssignPayload): Promise<AssignResponse> => {
  try {
    const response = await api.post(`${submissionBaseUrl}/assign`, body);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const autoAssign = async (body: AutoAssignPayload): Promise<AutoAssignResponse> => {
  try {
    const response = await api.post(`${submissionBaseUrl}/auto-assign`, body);
    return response.data;
  } catch (error) {
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

export const getAllExaminers = async (params: GetAllExaminerParameters) : Promise<GetAllExaminerResponse> => {
  try {
    const pageIndex = params.pageIndex || 0;
    const pageSize = params.pageSize || 10;
    const roleName = "Examiner";
    const response = await api.get(`${userBaseUrl}?pageIndex=${pageIndex}&pageSize=${pageSize}&roleName=${roleName}`);
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