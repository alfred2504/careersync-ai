import axios from "axios";
import API from "./api.js";

export const applyToJob = async (data: {
  jobId: string;
  coverLetter?: string;
}) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(`${API}/applications`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// ✅ GET APPLICATIONS FOR A JOB
export const getApplications = async (jobId: string) => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API}/applications/${jobId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (Array.isArray(res.data)) {
    return res.data;
  }

  if (Array.isArray(res.data?.applications)) {
    return res.data.applications;
  }

  return [];
};