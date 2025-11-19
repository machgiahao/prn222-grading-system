
import api from "@/axios/http";
import { MyTask } from "@/lib/types/common";
import {
  GradingDetails,
  GradePayload,
  GradeResponse,
} from "@/lib/types/examiner";

const submissionBaseUrl = "/submissions";
const gradesBaseUrl = "/grades";

export const getMyTasks = async (): Promise<MyTask[]> => {
  try {
    const response = await api.get<MyTask[]>(`${submissionBaseUrl}/my-tasks`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGradingDetails = async (
  submissionId: string
): Promise<GradingDetails> => {
  try {
    const response = await api.get<GradingDetails>(
      `${submissionBaseUrl}/${submissionId}/grading-details`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postSubmissionGrade = async (
  payload: GradePayload
): Promise<GradeResponse> => {
  try {
    const response = await api.post<GradeResponse>(gradesBaseUrl, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};