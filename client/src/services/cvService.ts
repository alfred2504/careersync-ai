import axios from "axios";

const API_ORIGIN = import.meta.env.VITE_API_URL || "";
const API_BASE = API_ORIGIN ? `${API_ORIGIN.replace(/\/$/, "")}/api` : "/api";

export const analyzeCV = async (file: File) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("cv", file);

  const res = await axios.post(`${API_BASE}/cv/analyze`, formData, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};