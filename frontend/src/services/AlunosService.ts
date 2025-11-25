import api from "./api"; // Instância do Axios configurada com interceptor JWT
import type {
  AlunoDetalhe,
  AlunoDetalheAPI,
  CreateAlunoData,
  UpdateAlunoData,
  DisciplinaFrontEnd,
} from "../types/Alunos";
import type { Casa, Turma } from "../types/CasaeTurma";

// =========================================================
// AlunoListaBackend
// Representa o objeto bruto (raw) que vem do backend
// =========================================================
export interface AlunoListaBackend {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  matricula: string;
  turno: string;
  turma: {
    id: number;
    serie: string;
    turno: string;
    curso?: { nome: string };
  };
  casa: {
    id: number;
    nome: string;
  };
  createdAt: string;
  updatedAt: string;
}

const BASE_URL = "/secretario/alunos";

// =========================================================
// FUNÇÃO PRINCIPAL PARA O ALUNO LOGADO
// =========================================================
export const getAlunoDetalheMe = async (): Promise<AlunoDetalhe> => {
  const response = await api.get("/aluno/info");
  const dataBruta: AlunoDetalheAPI = response.data;

  const disciplinasMapeadas: DisciplinaFrontEnd[] = dataBruta.matriculas.map(
    (m) => ({
      id: m.disciplina.id,
      nome: m.disciplina.nome,
      professor: m.disciplina.professor || "Professor(a) não informado(a)",
      horario: m.disciplina.horario || "Horário não informado",
    })
  );

  const alunoDetalhe: AlunoDetalhe = {
    id: dataBruta.id,
    nome: dataBruta.nome,
    email: dataBruta.email,
    cpf: dataBruta.cpf,
    telefone: dataBruta.telefone,
    dataNascimento: dataBruta.dataNascimento,
    matricula: dataBruta.matricula,
    curso: dataBruta.turma.curso?.nome || "Não Informado",
    turno: dataBruta.turma.turno || "Não Informado",
    nomeCasa: dataBruta.casa.nome,
    disciplinas: disciplinasMapeadas,
  };

  return alunoDetalhe;
};

// =========================================================
// FUNÇÕES CRUD DE ALUNOS
// =========================================================
export const getAlunos = async (): Promise<AlunoListaBackend[]> => {
  const response = await api.get(BASE_URL, {
    params: { include: "casa,turma" },
  });
  return response.data;
};

export const getAlunoById = async (id: number): Promise<AlunoListaBackend> => {
  const response = await api.get(`${BASE_URL}/${id}`);
  return response.data;
};

export const createAluno = async (
  data: CreateAlunoData
): Promise<AlunoListaBackend> => {
  const response = await api.post(BASE_URL, data);
  return response.data;
};

export const updateAluno = async (
  id: number,
  data: UpdateAlunoData
): Promise<AlunoListaBackend> => {
  const response = await api.patch(`${BASE_URL}/${id}`, data);
  return response.data;
};

export const deleteAluno = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};

// =========================================================
// FUNÇÕES AUXILIARES
// =========================================================
export const getCasas = async (): Promise<Casa[]> => {
  const response = await api.get("/casas");
  return response.data;
};

export const getTurmas = async (): Promise<Turma[]> => {
  const response = await api.get("/turmas");
  return response.data;
};
