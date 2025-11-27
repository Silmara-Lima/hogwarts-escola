// =========================================================================
// 1. Interfaces públicas do professor
// =========================================================================
export interface PublicProfessor {
  id: number;
  nome: string;
  email: string;
  matricula: string;
  departamento: string | null;
  createdAt: string;
  updatedAt: string;
}

// =========================================================================
// 2. Interfaces para criação e atualização
// =========================================================================
export interface ProfessorCreateData {
  nome: string;
  email: string;
  matricula: string;
  departamento: string;
  cpf: string;
  telefone: string;
  senha: string;
}

export interface ProfessorUpdateData {
  nome?: string;
  email?: string;
  departamento?: string | null;
  senha?: string;
  telefone?: string | null;
  cpf?: string;
  matricula?: string;
}

// =========================================================================
// 3. Estruturas de detalhes
// =========================================================================
export interface Turma {
  id: number;
  nome: string;
  turno: "Matutino" | "Vespertino" | "Noturno";
}

export interface DisciplinaMinistrada {
  id: number;
  nome: string;
  turmas: Turma[];
}

export interface ProfessorDetalhe {
  id: number;
  nome: string;
  matricula: string;
  email: string;
  departamento: string | null;
  cpf: string;
  telefone: string | null;
  disciplinasMinistradas: DisciplinaMinistrada[];
}

export interface AlunoDetalheProfessor {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  matricula: string;
  turno: string;
  casaId: number | null;
  turmaId: number;
  disciplinasLecionadasPeloProfessor: string[];
}

// =========================================================================
// 4. Tipos auxiliares
// =========================================================================
export interface DisciplinaTurmaVinculo {
  disciplinaId: number;
  turmaId: number;
}
