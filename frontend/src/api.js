import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((c) => {
  const token = localStorage.getItem("token");
  if (token) c.headers.Authorization = `Bearer ${token}`;
  return c;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
