import axios from "axios";

const API_ORIGIN = import.meta.env.VITE_API_URL || "";
const API_BASE = API_ORIGIN ? `${API_ORIGIN.replace(/\/$/, "")}/api` : "/api";

const authClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AuthResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: string;
  inviteToken?: string;
};

const AUTH_TOKEN_KEY = "careersync_token";
const AUTH_USER_KEY = "careersync_user";

export const loginUser = async (payload: LoginPayload) => {
  const { data } = await authClient.post<AuthResponse>("/auth/login", payload);
  return data;
};

export const registerUser = async (payload: RegisterPayload) => {
  const { data } = await authClient.post<AuthResponse>("/auth/register", payload);
  return data;
};

export const saveAuthSession = (token: string, user: AuthUser) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
export const getAuthUser = (): AuthUser | null => {
  const storedUser = localStorage.getItem(AUTH_USER_KEY);
  return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
};
