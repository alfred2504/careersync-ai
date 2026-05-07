import axios from "axios";
import { getAuthToken } from "./authService";

const API_ORIGIN = import.meta.env.VITE_API_URL || "";
const API_BASE = API_ORIGIN ? `${API_ORIGIN.replace(/\/$/, "")}/api` : "/api";
const MAX_CV_TEXT_CHARS = 20000;
const MAX_JOB_DESCRIPTION_CHARS = 12000;

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const clampText = (value: string, maxChars: number) => {
  const trimmed = value.trim();
  if (trimmed.length <= maxChars) {
    return trimmed;
  }

  return trimmed.slice(0, maxChars);
};

const preparePayload = (cvText: string, jobDescription?: string) => ({
  cvText: clampText(cvText, MAX_CV_TEXT_CHARS),
  jobDescription: jobDescription ? clampText(jobDescription, MAX_JOB_DESCRIPTION_CHARS) : undefined,
});

export const analyzeCV = async (file: File, jobDescription?: string) => {
  const cvText = await readFileAsText(file);
  const res = await axios.post(
    `${API_BASE}/ai/analyze-cv`,
    preparePayload(cvText, jobDescription),
    {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
};

export const analyzeCVText = async (cvText: string, jobDescription?: string) => {
  const res = await axios.post(
    `${API_BASE}/ai/analyze-cv`,
    preparePayload(cvText, jobDescription),
    {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
};
