import type { Casa, Turma } from "./CasaeTurma";

// ----------------------------
// NOVOS TIPOS DE RELAÇÃO API (Refletindo a resposta do Prisma)
// ----------------------------

export interface ProfessorNomeAPI {
  nome: string;
}

export interface TurmaDisciplinaAPI {
  turmaId: number;
  professor: ProfessorNomeAPI;
}

// ----------------------------
// Tipos da Disciplina na API
// ----------------------------

export interface DisciplinaAPI {
  id: number;
  nome: string;
  professor: string;
  turmasDisciplinas: TurmaDisciplinaAPI[];
}

// ----------------------------
// Tipos da Matrícula na API
// ----------------------------
export interface MatriculaAPI {
  id: number;
  alunoId: number;
  disciplinaId: number;
  grade?: string | null;
  createdAt: string;
  updatedAt: string;
  disciplina: DisciplinaAPI;
}

// ----------------------------
// Tipos de Aluno (API)
// ----------------------------

export interface AlunoDetalheAPI {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string | null;
  dataNascimento?: string;
  matricula: string;
  turno: string;
  turma: Turma;
  casa: Casa | null;
  matriculas: MatriculaAPI[];
  turmaId: number;
  casaId: number | null;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------
// Tipos para Frontend (mapeados)
// ----------------------------

export interface DisciplinaFrontEnd {
  id: number;
  nome: string;
  professor: string;
}

export interface AlunoDetalheFrontEnd {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string | null;
  dataNascimento?: string;
  matricula: string;
  curso?: string; // mapeado de turma.serie
  turno: Turma["turno"] | string;
  nomeCasa: string; // mapeado de casa.nome

  disciplinas: DisciplinaFrontEnd[];
}

export type AlunoDetalhe = AlunoDetalheFrontEnd;

// ----------------------------
// Tipos base para tabela/listagem
// ----------------------------

export interface Aluno {
  id: number;
  nome: string;
  matricula: string;
  dataNascimento?: string;
  cpf: string;
  email: string;
  telefone?: string | null;
  turno: Turma["turno"] | string;
  casa?: { id: number; nome: string } | null;
  turma?: { id: number; serie: string; turno: string } | null;
}

// ----------------------------
// Tipos para criação/atualização
// ----------------------------
export type CreateAlunoData = {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone?: string | null;
  matricula: string;
  turno: Turma["turno"];
  casaId?: number;
  turmaId: number;
  dataNascimento: string;
  curso?: string;
};

export type UpdateAlunoData = Partial<Omit<CreateAlunoData, "senha">>;

// ----------------------------
// Tipo seguro para frontend
// ----------------------------
export type AlunoFrontEnd = Omit<Aluno, "matriculas">;
