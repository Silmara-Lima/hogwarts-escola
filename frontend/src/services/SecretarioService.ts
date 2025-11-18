import { api } from "../apiCore/apiCore";

// --- Tipos de Secretário/Administrativo ---
export interface Secretario {
  id: number;
  nome: string;
  email: string;
  cargo: string; // Ex: 'Assistente Administrativo', 'Coordenador', etc.
  setor: string; // Ex: 'Registro Acadêmico', 'Financeiro'
}

export interface CreateSecretarioDTO {
  nome: string;
  email: string;
  cargo: string;
  setor: string;
}

export interface UpdateSecretarioDTO {
  nome?: string;
  email?: string;
  cargo?: string;
  setor?: string;
}
// ------------------------------------------

const ENDPOINT = "/secretarios";

/**
 * Busca todos os secretários/membros da equipe administrativa.
 * @returns Promise<Secretario[]> Lista de secretários.
 */
export const getSecretarios = async (): Promise<Secretario[]> => {
  // GET http://localhost:3000/api/secretarios
  const response = await api.get<Secretario[]>(ENDPOINT);
  return response.data;
};

/**
 * Cria um novo registro de secretário.
 * @param secretarioData Dados para criação do registro.
 * @returns Promise<Secretario> O registro criado, incluindo seu novo ID.
 */
export const createSecretario = async (
  secretarioData: CreateSecretarioDTO
): Promise<Secretario> => {
  // POST http://localhost:3000/api/secretarios
  const response = await api.post<Secretario>(ENDPOINT, secretarioData);
  return response.data;
};

/**
 * Atualiza um registro de secretário existente.
 * @param id ID do secretário a ser atualizado.
 * @param secretarioData Dados parciais para atualização.
 * @returns Promise<Secretario> O registro atualizado.
 */
export const updateSecretario = async (
  id: number,
  secretarioData: UpdateSecretarioDTO
): Promise<Secretario> => {
  // PUT http://localhost:3000/api/secretarios/:id
  const response = await api.put<Secretario>(
    `${ENDPOINT}/${id}`,
    secretarioData
  );
  return response.data;
};

/**
 * Deleta um registro de secretário pelo ID.
 * @param id ID do secretário a ser deletado.
 * @returns Promise<void>
 */
export const deleteSecretario = async (id: number): Promise<void> => {
  // DELETE http://localhost:3000/api/secretarios/:id
  await api.delete(`${ENDPOINT}/${id}`);
};
