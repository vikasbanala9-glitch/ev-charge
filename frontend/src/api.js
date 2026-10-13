import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const errorMessage = (err) =>
  err?.response?.data?.message || "Something went wrong. Check that the server is running.";

export const rupees = (n) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// yyyy-mm-dd in the user's local time (toISOString would use UTC)
export const localDate = (d = new Date()) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export const hhmm = (iso) => iso.slice(11, 16);

export const prettyDateTime = (iso) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export const typeLabel = { AC_SLOW: "AC slow", AC_FAST: "AC fast", DC_FAST: "DC fast" };

export default api;
