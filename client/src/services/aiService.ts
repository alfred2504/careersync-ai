import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const getToken = () => {
  return localStorage.getItem("token");
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const analyzeCV = async (cvText, jobDescription = "") => {
  try {
    const response = await apiClient.post("/ai/analyze-cv", {
      cvText,
      jobDescription,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to analyze CV"
    );
  }
};

export const generateCoverLetter = async (
  jobTitle,
  companyName,
  jobDescription = "",
  cvHighlights = "",
  tone = "professional"
) => {
  try {
    const response = await apiClient.post("/ai/generate-cover-letter", {
      jobTitle,
      companyName,
      jobDescription,
      cvHighlights,
      tone,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to generate cover letter"
    );
  }
};

export const generateJobDescription = async (
  jobTitle,
  companyName,
  department = "",
  seniority = "",
  keyResponsibilities = ""
) => {
  try {
    const response = await apiClient.post("/ai/generate-job-description", {
      jobTitle,
      companyName,
      department,
      seniority,
      keyResponsibilities,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to generate job description"
    );
  }
};
