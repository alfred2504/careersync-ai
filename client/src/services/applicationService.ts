import axios from "axios";
import { getAuthToken } from "./authService";

const API_ORIGIN = import.meta.env.VITE_API_URL || "";
const API_BASE = API_ORIGIN ? `${API_ORIGIN.replace(/\/$/, "")}/api` : "/api";

const applicationClient = axios.create({
  baseURL: API_BASE,
});

export type ApplyJobPayload = {
  jobId: string;
  coverLetter?: string;
  cv?: File | null;
};

export const applyForJob = async ({ jobId, coverLetter, cv: _cv }: ApplyJobPayload) => {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const { data } = await applicationClient.post(
      "/applications",
      {
        jobId,
        coverLetter: coverLetter || null,
        // Note: cv file uploads not supported in serverless environment
        // Store coverLetter as text instead
      },
      { headers }
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiMessage = error.response?.data?.message;
      throw new Error(apiMessage || error.message || "Failed to submit application");
    }

    throw error;
  }
};

export const getApplications = async (jobId: string) => {
  const token = getAuthToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const { data } = await applicationClient.get(`/applications/${jobId}`, { headers });
  return data;
};

export const updateApplicationStatus = async (applicationId: string, status: string) => {
  const token = getAuthToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const { data } = await applicationClient.put(`/applications/${applicationId}/status`, { status }, { headers });
  return data;
};
