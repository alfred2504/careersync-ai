import axios from "axios";
import API from "./api.js";

const tokenHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const createJob = async (formData: {
  title: string;
  company: string;
  location: string;
  description: string;
}) => {
  const res = await axios.post(`${API}/jobs`, formData, tokenHeader());
  return res.data;
};

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

// ✅ ADMIN: GET ALL JOBS
export const getAllJobs = async () => {
  const res = await axios.get(`${API}/jobs/admin/all`, tokenHeader());

  if (Array.isArray(res.data)) {
    return res.data;
  }

  if (Array.isArray(res.data?.jobs)) {
    return res.data.jobs;
  }

  return [];
};

// ✅ ADMIN: UPDATE STATUS
export const updateJobStatus = async (
  id: string,
  status: string
) => {
  const res = await axios.put(
    `${API}/jobs/${id}/status`,
    { status },
    tokenHeader()
  );

  return res.data;
};