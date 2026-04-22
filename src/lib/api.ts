import axios from "axios";
import { secureStorage } from "./secureStorage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = secureStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors - ONLY redirect on explicit logout or truly invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Never auto-clear storage on 401 - let AuthContext handle it
    // This prevents accidental logouts on any failed request
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  verifyOtp: async (data: { email: string; otp: string }) => {
    const response = await api.post("/auth/verify-otp", data);
    if (response.data.token) {
      secureStorage.setToken(response.data.token);
      secureStorage.setUser(response.data.user);
    }
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post("/auth/login", data);
    if (response.data.token) {
      secureStorage.setToken(response.data.token);
      secureStorage.setUser(response.data.user);
    }
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  validateToken: async () => {
    try {
      const response = await api.get("/auth/profile");
      return { valid: true, user: response.data };
    } catch (error) {
      return { valid: false, user: null };
    }
  },

  logout: () => {
    secureStorage.clearAll();
  },
};
