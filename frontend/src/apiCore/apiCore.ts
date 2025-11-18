import axios from "axios";

/**
 * Instância base do Axios configurada para se comunicar com o backend.
 * Ajuste a baseURL para o endereço do seu servidor de API.
 */
export const api = axios.create({
  // URL de exemplo. Você deve mudar para o endereço real da sua API.
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Em um ambiente real, você adicionaria aqui interceptors para autenticação (tokens JWT, etc.)
