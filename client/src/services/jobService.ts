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
