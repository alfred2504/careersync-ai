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