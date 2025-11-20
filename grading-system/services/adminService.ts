import api from "@/axios/http";
import { Semester } from "@/lib/types/admin";

const semesterBaseUrl = "/semester";

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
