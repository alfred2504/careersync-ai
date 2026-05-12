import axios from "axios";
import { getAuthToken } from "./authService";

const API_ORIGIN = import.meta.env.VITE_API_URL || "";
const API_BASE = API_ORIGIN ? `${API_ORIGIN.replace(/\/$/, "")}/api` : "/api";

const aiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export type DraftFormTextPayload = {
  jobTitle: string;
  companyName: string;
  jobDescription?: string;
  responsibilities?: string;
  skills?: string;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  coverLetter?: string;
  message?: string;
};

export type DraftFormTextResponse = {
  success?: boolean;
  fallback?: boolean;
  drafts: {
    coverLetter: string;
    message: string;
    suggestedName?: string;
    suggestedEmail?: string;
    suggestedPhone?: string;
  };
};

export type DraftJobPostPayload = {
  title: string;
  company: string;
  location: string;
  category?: string;
  employmentType?: string;
  salaryRange?: string;
  experienceLevel?: string;
  description?: string;
  responsibilities?: string;
  skills?: string;
  tags?: string;
};

export type DraftJobPostResponse = {
  success?: boolean;
  fallback?: boolean;
  draft: {
    title: string;
    company: string;
    location: string;
    category: string;
    employmentType: string;
    salaryRange: string;
    experienceLevel: string;
    description: string;
    responsibilities: string;
    skills: string;
    tags: string;
  };
};

export type GenerateJobDescriptionPayload = {
  jobTitle: string;
  companyName: string;
  department?: string;
  seniority?: string;
  keyResponsibilities?: string;
};

export type GenerateJobDescriptionResponse = {
  success?: boolean;
  fallback?: boolean;
  jobDescription: string;
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const draftFormText = async (payload: DraftFormTextPayload) => {
  const { data } = await aiClient.post<DraftFormTextResponse>(
    "/ai/draft-form-text",
    payload,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  return data;
};

export const draftJobPost = async (payload: DraftJobPostPayload) => {
  const { data } = await aiClient.post<DraftJobPostResponse>(
    "/ai/draft-job-post",
    payload,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  return data;
};

export const generateJobDescription = async (payload: GenerateJobDescriptionPayload) => {
  const { data } = await aiClient.post<GenerateJobDescriptionResponse>(
    "/ai/generate-job-description",
    payload,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  return data;
};