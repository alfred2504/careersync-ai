import axios from "axios";

import API from "./api.js";

const tokenHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const createAdminInvite = async (data: { email: string; name?: string }) => {
  const res = await axios.post(`${API}/admin/invites`, data, tokenHeader());
  return res.data;
};

export const getAdminInvites = async () => {
  const res = await axios.get(`${API}/admin/invites`, tokenHeader());
  return Array.isArray(res.data?.invites) ? res.data.invites : [];
};
