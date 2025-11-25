import axios from "axios";

// =========================================================
// 1. Cria a instância do Axios
// =========================================================
const api = axios.create({
  baseURL: "http://localhost:3000/api",
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
