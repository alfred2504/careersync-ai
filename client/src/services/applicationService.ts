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