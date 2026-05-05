import axios from "axios";

const API_ORIGIN = import.meta.env.VITE_API_URL || "";
const API_BASE = API_ORIGIN ? `${API_ORIGIN.replace(/\/$/, "")}/api` : "/api";

const jobClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  status?: string;
  createdAt?: string;
  category?: string;
  employmentType?: string;
  salaryRange?: string;
  experienceLevel?: string;
  tags?: string[];
  responsibilities?: string[];
  skills?: string[];
};

export type JobFilters = {
  title?: string;
  location?: string;
};

export const getJobs = async (filters: JobFilters = {}) => {
  const { data } = await jobClient.get<Job[]>("/jobs", {
    params: {
      title: filters.title || undefined,
      location: filters.location || undefined,
    },
  });
  return data;
};

export const getJobById = async (jobId: string) => {
  const { data } = await jobClient.get<Job>(`/jobs/${jobId}`);
  return data;
};

export const getAllJobs = async () => {
  const { data } = await jobClient.get<Job[]>("/jobs/admin/all");
  return data;
};

export const updateJobStatus = async (jobId: string, status: string) => {
  const { data } = await jobClient.put(`/jobs/${jobId}/status`, { status });
  return data;
};
