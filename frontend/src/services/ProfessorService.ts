import { api } from "../apiCore/apiCore";

// --- Tipos de Professor (Definidos aqui para evitar erros de importação de arquivo separado) ---
export interface Professor {
  id: number;
  nome: string;
  disciplinaId: number;
  disciplinaNome: string;
}
export interface CreateProfessorDTO {
  nome: string;
  disciplinaId: number;
}
export interface UpdateProfessorDTO {
  nome?: string;
  disciplinaId?: number;
}
// ---------------------------------------------------------------------------------------

const ENDPOINT = "/professores";

/**
 * Busca todos os professores cadastrados.
 * @returns Promise<Professor[]> Lista de professores.
 */
export const getProfessores = async (): Promise<Professor[]> => {
  const response = await api.get<Professor[]>(ENDPOINT);
  return response.data;
};

/**
 * Cria um novo professor.
 * @param professorData Dados para criação do professor.
 * @returns Promise<Professor> O professor criado.
 */
export const createProfessor = async (
  professorData: CreateProfessorDTO
): Promise<Professor> => {
  const response = await api.post<Professor>(ENDPOINT, professorData);
  return response.data;
};

/**
 * Atualiza um professor existente.
 * @param id ID do professor a ser atualizado.
 * @param professorData Dados parciais para atualização.
 * @returns Promise<Professor> O professor atualizado.
 */
export const updateProfessor = async (
  id: number,
  professorData: UpdateProfessorDTO
): Promise<Professor> => {
  const response = await api.put<Professor>(`${ENDPOINT}/${id}`, professorData);
  return response.data;
};

/**
 * Deleta um professor pelo ID.
 * @param id ID do professor a ser deletado.
 * @returns Promise<void>
 */
export const deleteProfessor = async (id: number): Promise<void> => {
  await api.delete(`${ENDPOINT}/${id}`);
};
