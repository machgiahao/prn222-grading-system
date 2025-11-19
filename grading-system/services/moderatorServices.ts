import api from "@/axios/http";
import {
  ModerationQueueItem,
  VerifyViolationResponse,
  VerifyViolationPayload,
} from "@/lib/types/moderator";

const submissionBaseUrl = "/submissions";

export const getModerationQueue = async (): Promise<ModerationQueueItem[]> => {
    try {
      const response = await api.get<ModerationQueueItem[]>(`${submissionBaseUrl}/moderation-queue`);
      return response.data;
    } catch (error) {
      throw error;
    }
};

export const verifyViolation = async (
    payload: VerifyViolationPayload
  ): Promise<VerifyViolationResponse> => {
    try {
      const response = await api.post<VerifyViolationResponse>(submissionBaseUrl + "/verify-violation", payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  };