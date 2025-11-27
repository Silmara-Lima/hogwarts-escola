import axios from "axios";

// =========================================================
// 1. Cria a instância do Axios
// =========================================================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// =========================================================
// 2. Interceptor de Requisição (adiciona token JWT)
// =========================================================
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("@App:token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
