import { api } from "../apiCore/apiCore";

// Define a estrutura mínima esperada para o objeto de credenciais de login
interface LoginCredentials {
  email: string;
  senha: string;
}

// Define a estrutura esperada para a resposta bem-sucedida do login
interface AuthResponse {
  token: string;
  userId: string;
  nome: string;
  // Outras informações do usuário que o backend pode retornar
}

/**
 * O AuthService é responsável por toda a lógica de autenticação.
 */
export const authService = {
  /**
   * Envia as credenciais para o backend e realiza o login.
   * @param credenciais O email e senha do usuário.
   * @returns Uma Promise que resolve para os dados de resposta (token, usuário).
   */
  async login(credenciais: LoginCredentials): Promise<AuthResponse> {
    try {
      // O Axios faz a requisição POST para a rota /auth/login
      const response = await api.post<AuthResponse>("/auth/login", credenciais);

      const { token } = response.data;

      // 1. Armazena o token (Este é o passo crucial para o JWT)
      localStorage.setItem("authToken", token);

      // 2. Retorna os dados para o componente que chamou
      return response.data;
    } catch (error) {
      // Trata erros de requisição (e.g., credenciais inválidas, servidor fora do ar)
      if (axios.isAxiosError(error) && error.response) {
        // Lança o erro de volta para ser tratado pelo componente de UI
        throw new Error(
          error.response.data.message ||
            "Credenciais inválidas ou erro no servidor."
        );
      }
      throw new Error("Erro de rede desconhecido ao tentar fazer login.");
    }
  },

  /**
   * Remove o token e "desloga" o usuário.
   */
  logout(): void {
    localStorage.removeItem("authToken");
    // Em um app real, você também limparia o estado global (Context/Redux) aqui.
    console.log("Usuário deslogado. Token removido.");
  },

  /**
   * Verifica se há um token de autenticação válido (simulação).
   * @returns boolean
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("authToken");
    // Em um app real, você também verificaria se o token não expirou.
    return !!token;
  },
};

// Se você estiver usando TypeScript, é bom definir essa importação de tipo
// para uso interno do serviço.
import * as axios from "axios";
