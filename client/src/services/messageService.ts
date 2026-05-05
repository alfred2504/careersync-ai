import axios from "axios";

const API_ORIGIN = import.meta.env.VITE_API_URL || "";
const API_BASE = API_ORIGIN ? `${API_ORIGIN.replace(/\/$/, "")}/api` : "/api";

const messageClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export type MessagePayload = {
  jobId?: string;
  jobTitle?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
};

export const sendJobMessage = async (payload: MessagePayload) => {
  const { data } = await messageClient.post("/messages", payload);
  return data;
};
