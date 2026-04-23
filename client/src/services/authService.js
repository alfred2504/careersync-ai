import axios from "axios";

const API = "http://localhost:3000/api";

export const registerUser = async (data) => {
  const res = await axios.post(`${API}/auth/register`, data);
  return res.data;
};