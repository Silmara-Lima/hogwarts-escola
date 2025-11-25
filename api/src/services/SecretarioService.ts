import { prisma } from "../database/prisma";
import { Aluno, Professor } from "@prisma/client";
import { randomUUID } from "crypto";
import {
  createAlunoSchema,
  createProfessorSchema,
  CreateAlunoData,
  CreateProfessorData,
} from "../schemas/validation";

// =========================================================================
// 1. SCHEMAS ZOD
// =========================================================================
export const AlunoCreateSchema = createAlunoSchema;
export const ProfessorCreateSchema = createProfessorSchema;

// =========================================================================
// 2. MÉTODOS DE GESTÃO
// =========================================================================

export const getDashboardStats = async () => {
  const [totalProfessores, totalAlunos, totalTurmas, alunosPorCasa, casas] =
    await Promise.all([
      prisma.professor.count(),
      prisma.aluno.count(),
      prisma.turma.count(),
      prisma.aluno.groupBy({ by: ["casaId"], _count: { id: true } }),
      prisma.casa.findMany({ select: { id: true, nome: true } }),
    ]);

  const casaMap = new Map(casas.map((c) => [c.id, c.nome]));

  const casasStats = alunosPorCasa
    .filter((stat) => stat.casaId !== null)
    .map((stat) => ({
      nome: casaMap.get(stat.casaId!) || "Casa Desconhecida",
      alunos: stat._count.id,
    }));

  return {
    totalProfessores,
    totalAlunos,
    turmasAtivas: totalTurmas,
    casas: casasStats,
  };
};

export const createAluno = async (data: CreateAlunoData): Promise<Aluno> => {
  const payload = {
    ...data,
    telefone: data.telefone ?? "",
  };

  return prisma.aluno.create({
    data: payload,
  });
};

export const createProfessor = async (
  data: CreateProfessorData
): Promise<Professor> => {
  const matriculaGerada = randomUUID();

  const payload = {
    ...data,
    telefone: data.telefone ?? "",
    matricula: matriculaGerada,
  };

  return prisma.professor.create({
    data: payload,
  });
};

export const createDisciplina = async (
  nome: string,
  cargaHoraria: number,
  eObrigatoria: boolean
) => {
  return prisma.disciplina.create({
    data: { nome, cargaHoraria, eObrigatoria },
  });
};
