import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
export const BASE_URL = API_URL.replace(/\/api$/, "");

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("psms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

