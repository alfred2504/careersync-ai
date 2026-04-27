import axios from "axios";
import API from "./api.js";

export const createJob = async (formData: {
  title: string;
  company: string;
  location: string;
  description: string;
}) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(`${API}/jobs`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// ✅ GET ALL JOBS
export const getJobs = async () => {
  const res = await axios.get(`${API}/jobs`);

  if (Array.isArray(res.data)) {
    return res.data;
  }

  if (Array.isArray(res.data?.jobs)) {
    return res.data.jobs;
  }

  return [];
};