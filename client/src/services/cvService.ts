import axios from "axios";
import { getAuthToken } from "./authService";

const API_ORIGIN = import.meta.env.VITE_API_URL || "";
const API_BASE = API_ORIGIN ? `${API_ORIGIN.replace(/\/$/, "")}/api` : "/api";

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });

export const analyzeCV = async (file: File, jobDescription?: string) => {
  const token = getAuthToken();
  const cvText = await readFileAsText(file);

  const res = await axios.post(
    `${API_BASE}/ai/analyze-cv`,
    { cvText, jobDescription },
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
};