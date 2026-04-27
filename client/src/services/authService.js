import axios from "axios";
import API from "./api.js";

export const registerUser = async (data) => {
  const res = await axios.post(`${API}/auth/register`, data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await axios.post(`${API}/auth/login`, data);
  return res.data;
};