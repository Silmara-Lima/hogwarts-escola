import { Professor } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { prisma } from "../database/prisma";

// =========================================================================
// TIPOS
// =========================================================================

export type ProfessorCreateData = {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone: string;
  matricula: string;
  departamento?: string | null;
};

export type PublicProfessor = Omit<Professor, "senha" | "cpf" | "telefone">;
export type ProfessorUpdateData = Partial<ProfessorCreateData>;

interface TurmaDetalhe {
  id: number;
  serie: string;
  turno: string;
}

interface DisciplinaMinistrada {
  id: number;
  nome: string;
  turmas: TurmaDetalhe[];
}

export interface ProfessorDetalhe {
  id: number;
  nome: string;
  matricula: string;
  departamento: string | null;
  email: string;
  cpf: string;
  telefone: string;
  disciplinasMinistradas: DisciplinaMinistrada[];
}

export interface AlunoDetalheProfessor {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: Date;
  matricula: string;
  turno: string;
  casaId: number | null;
  turmaId: number;
  disciplinasLecionadasPeloProfessor: string[];
}

export interface DisciplinaTurmaVinculo {
  disciplinaId: number;
  turmaId: number;
}

// =========================================================================
// FUNÇÕES INTERNAS
// =========================================================================

const getDetailsWithRelations = async (
  professorId: number
): Promise<ProfessorDetalhe | null> => {
  const professorData = await prisma.professor.findUnique({
    where: { id: professorId },
    select: {
      id: true,
      nome: true,
      matricula: true,
      email: true,
      departamento: true,
      cpf: true,
      telefone: true,
      turmasDisciplinas: {
        select: {
          disciplina: { select: { id: true, nome: true } },
          turma: { select: { id: true, serie: true, turno: true } },
        },
      },
    },
  });

  if (!professorData) return null;

  const groupedDisciplines = new Map<number, DisciplinaMinistrada>();
  professorData.turmasDisciplinas.forEach((rel) => {
    const discId = rel.disciplina.id;
    const turmaDetail: TurmaDetalhe = {
      id: rel.turma.id,
      serie: rel.turma.serie,
      turno: rel.turma.turno,
    };

    if (!groupedDisciplines.has(discId)) {
      groupedDisciplines.set(discId, {
        id: discId,
        nome: rel.disciplina.nome,
        turmas: [turmaDetail],
      });
    } else {
      const turmasExistentes = groupedDisciplines.get(discId)!.turmas;
      if (!turmasExistentes.some((t) => t.id === turmaDetail.id)) {
        turmasExistentes.push(turmaDetail);
      }
    }
  });

  return {
    id: professorData.id,
    nome: professorData.nome,
    matricula: professorData.matricula,
    departamento: professorData.departamento,
    email: professorData.email,
    cpf: professorData.cpf,
    telefone: professorData.telefone,
    disciplinasMinistradas: Array.from(groupedDisciplines.values()),
  };
};

// =========================================================================
// DETALHES
// =========================================================================

export const getMeDetails = async (
  email: string
): Promise<ProfessorDetalhe> => {
  const professorData = await prisma.professor.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!professorData || typeof professorData.id !== "number") {
    throw new Error("Professor autenticado não encontrado.");
  }

  return getDetailsWithRelations(professorData.id) as Promise<ProfessorDetalhe>;
};

export const getProfessorDetails = async (
  id: number
): Promise<ProfessorDetalhe | null> => {
  return getDetailsWithRelations(id);
};

// =========================================================================
// CRUD
// =========================================================================

export const createProfessor = async (
  data: ProfessorCreateData
): Promise<PublicProfessor> => {
  const existing = await prisma.professor.findFirst({
    where: {
      OR: [
        { email: data.email },
        { matricula: data.matricula },
        { cpf: data.cpf },
      ],
    },
  });

  if (existing) {
    throw {
      code: "P2002",
      meta: {
        target:
          existing.email === data.email
            ? "email"
            : existing.matricula === data.matricula
            ? "matricula"
            : "cpf",
      },
    };
  }

  const hashedPassword = await bcrypt.hash(data.senha, 10);

  const newProfessor = await prisma.professor.create({
    data: { ...data, senha: hashedPassword },
    select: {
      id: true,
      nome: true,
      email: true,
      matricula: true,
      departamento: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return newProfessor as PublicProfessor;
};

export const getProfessores = async (): Promise<PublicProfessor[]> => {
  return (await prisma.professor.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      matricula: true,
      departamento: true,
      createdAt: true,
      updatedAt: true,
    },
  })) as PublicProfessor[];
};

export const getById = async (id: number): Promise<Professor | null> => {
  return prisma.professor.findUnique({ where: { id } });
};

export const updateProfessor = async (
  id: number,
  data: ProfessorUpdateData
): Promise<PublicProfessor> => {
  if (data.senha) data.senha = await bcrypt.hash(data.senha, 10);

  const updatedProfessor = await prisma.professor.update({
    where: { id },
    data,
    select: {
      id: true,
      nome: true,
      email: true,
      matricula: true,
      departamento: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedProfessor as PublicProfessor;
};

export const deleteProfessor = async (id: number): Promise<Professor> => {
  return prisma.professor.delete({ where: { id } });
};

// =========================================================================
// VINCULAÇÃO DISCIPLINAS/TURMAS
// =========================================================================

export const vincularDisciplinas = async (
  professorId: number,
  vinculos: DisciplinaTurmaVinculo[]
): Promise<ProfessorDetalhe> => {
  const professorExists = await prisma.professor.findUnique({
    where: { id: professorId },
    select: { id: true },
  });

  if (!professorExists)
    throw { code: "P2025", message: "Professor não encontrado." };

  const dataToCreate = vinculos.map((v) => ({
    professorId,
    disciplinaId: v.disciplinaId,
    turmaId: v.turmaId,
  }));

  await prisma.$transaction([
    prisma.turmaDisciplina.deleteMany({ where: { professorId } }),
    prisma.turmaDisciplina.createMany({
      data: dataToCreate,
      skipDuplicates: true,
    }),
  ]);

  return getDetailsWithRelations(professorId) as Promise<ProfessorDetalhe>;
};

// =========================================================================
// PAINEL DE ALUNOS
// =========================================================================

export const getProfessorAlunos = async (
  professorId: number
): Promise<AlunoDetalheProfessor[]> => {
  const professorExists = await prisma.professor.findUnique({
    where: { id: professorId },
    select: { id: true },
  });
  if (!professorExists) throw new Error("Professor não encontrado");

  const turmasDisciplinas = await prisma.turmaDisciplina.findMany({
    where: { professorId },
    select: { disciplinaId: true, turmaId: true },
  });

  if (turmasDisciplinas.length === 0) return [];

  const matriculas = await prisma.matricula.findMany({
    where: {
      disciplinaId: { in: turmasDisciplinas.map((td) => td.disciplinaId) },
    },
    include: { aluno: true, disciplina: true },
  });

  const alunosDetalhesMap = new Map<number, AlunoDetalheProfessor>();
  const disciplinaIdsLecionadas = turmasDisciplinas.map(
    (td) => td.disciplinaId
  );

  for (const m of matriculas) {
    if (!disciplinaIdsLecionadas.includes(m.disciplinaId)) continue;

    const aluno = m.aluno;
    if (!aluno) continue;

    const { senha, ...alunoSemCamposSensitivos } = aluno;

    if (!alunosDetalhesMap.has(aluno.id)) {
      alunosDetalhesMap.set(aluno.id, {
        ...alunoSemCamposSensitivos,
        disciplinasLecionadasPeloProfessor: [m.disciplina.nome],
        turmaId: aluno.turmaId,
        turno: "",
        casaId: null,
      });
    } else {
      const alunoExistente = alunosDetalhesMap.get(aluno.id)!;
      if (
        !alunoExistente.disciplinasLecionadasPeloProfessor.includes(
          m.disciplina.nome
        )
      ) {
        alunoExistente.disciplinasLecionadasPeloProfessor.push(
          m.disciplina.nome
        );
      }
    }
  }

  return Array.from(alunosDetalhesMap.values());
};
