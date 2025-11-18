import { api } from "../apiCore/apiCore"; // Importa a instância configurada do Axios

// --- Tipos de Aluno (Definidos aqui para evitar erros de importação de arquivo separado) ---
export interface Aluno {
  id: number;
  nome: string;
  casaId: number;
  casaNome: string;
  ano: number;
}
export interface CreateAlunoDTO {
  nome: string;
  casaId: number;
  ano: number;
}
export interface UpdateAlunoDTO {
  nome?: string;
  casaId?: number;
  ano?: number;
}
// ---------------------------------------------------------------------------------------

const ENDPOINT = "/alunos";

/**
 * Busca todos os alunos cadastrados.
 * @returns Promise<Aluno[]> Lista de alunos.
 */
export const getAlunos = async (): Promise<Aluno[]> => {
  // GET http://localhost:3000/api/alunos
  const response = await api.get<Aluno[]>(ENDPOINT);
  return response.data;
};

/**
 * Busca um aluno específico pelo ID.
 * @param id ID do aluno.
 * @returns Promise<Aluno> O aluno encontrado.
 */
export const getAlunoById = async (id: number): Promise<Aluno> => {
  // GET http://localhost:3000/api/alunos/:id
  const response = await api.get<Aluno>(`${ENDPOINT}/${id}`);
  return response.data;
};

/**
 * Cria um novo aluno.
 * @param alunoData Dados para criação do aluno (sem o ID).
 * @returns Promise<Aluno> O aluno criado, incluindo seu novo ID.
 */
export const createAluno = async (
  alunoData: CreateAlunoDTO
): Promise<Aluno> => {
  // POST http://localhost:3000/api/alunos
  const response = await api.post<Aluno>(ENDPOINT, alunoData);
  return response.data;
};

/**
 * Atualiza um aluno existente.
 * @param id ID do aluno a ser atualizado.
 * @param alunoData Dados parciais para atualização.
 * @returns Promise<Aluno> O aluno atualizado.
 */
export const updateAluno = async (
  id: number,
  alunoData: UpdateAlunoDTO
): Promise<Aluno> => {
  // PUT http://localhost:3000/api/alunos/:id
  const response = await api.put<Aluno>(`${ENDPOINT}/${id}`, alunoData);
  return response.data;
};

/**
 * Deleta um aluno pelo ID.
 * @param id ID do aluno a ser deletado.
 * @returns Promise<void>
 */
export const deleteAluno = async (id: number): Promise<void> => {
  // DELETE http://localhost:3000/api/alunos/:id
  await api.delete(`${ENDPOINT}/${id}`);
};
