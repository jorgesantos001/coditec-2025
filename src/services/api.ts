import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // ou sua URL base da API
});

// Interceptor para adicionar o token em cada requisição
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
