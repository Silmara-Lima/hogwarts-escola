import { api } from "../apiCore/apiCore";

// --- Tipos de Disciplina (Definidos aqui para evitar erros de importação de arquivo separado) ---
export interface Disciplina {
  id: number;
  nome: string;
  cargaHoraria: number; // Exemplo: Carga horária em horas/semana
}
export interface CreateDisciplinaDTO {
  nome: string;
  cargaHoraria: number;
}
export interface UpdateDisciplinaDTO {
  nome?: string;
  cargaHoraria?: number;
}
// ---------------------------------------------------------------------------------------

const ENDPOINT = "/disciplinas";

/**
 * Busca todas as disciplinas cadastradas.
 * @returns Promise<Disciplina[]> Lista de disciplinas.
 */
export const getDisciplinas = async (): Promise<Disciplina[]> => {
  // GET http://localhost:3000/api/disciplinas
  const response = await api.get<Disciplina[]>(ENDPOINT);
  return response.data;
};

/**
 * Cria uma nova disciplina.
 * @param disciplinaData Dados para criação da disciplina (sem o ID).
 * @returns Promise<Disciplina> A disciplina criada, incluindo seu novo ID.
 */
export const createDisciplina = async (
  disciplinaData: CreateDisciplinaDTO
): Promise<Disciplina> => {
  // POST http://localhost:3000/api/disciplinas
  const response = await api.post<Disciplina>(ENDPOINT, disciplinaData);
  return response.data;
};

/**
 * Atualiza uma disciplina existente.
 * @param id ID da disciplina a ser atualizada.
 * @param disciplinaData Dados parciais para atualização.
 * @returns Promise<Disciplina> A disciplina atualizada.
 */
export const updateDisciplina = async (
  id: number,
  disciplinaData: UpdateDisciplinaDTO
): Promise<Disciplina> => {
  // PUT http://localhost:3000/api/disciplinas/:id
  const response = await api.put<Disciplina>(
    `${ENDPOINT}/${id}`,
    disciplinaData
  );
  return response.data;
};

/**
 * Deleta uma disciplina pelo ID.
 * @param id ID da disciplina a ser deletada.
 * @returns Promise<void>
 */
export const deleteDisciplina = async (id: number): Promise<void> => {
  // DELETE http://localhost:3000/api/disciplinas/:id
  await api.delete(`${ENDPOINT}/${id}`);
};
