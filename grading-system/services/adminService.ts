import api from "@/axios/http";
import { Semester, Subject } from "@/lib/types/admin";

const semesterBaseUrl = "/semester";
const subjectBaseUrl = "/subject";
const reportBaseUrl = "/reports";
const userBaseUrl = "/users";


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

export const getAllUserAccounts = async (user: any) : Promise<void> => {
  // co pagination
  try{
    await api.post(`${userBaseUrl}`, user)
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