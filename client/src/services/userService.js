import axios from "axios";
import API from "./api.js";

export const getProfile = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API}/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};