import { prisma } from "../database/prisma";
import { Matricula } from "@prisma/client";

// =========================================================================
// Tipos
// =========================================================================

interface MatriculaCreateData {
  alunoId: number;
  disciplinaId: number;
}

// =========================================================================
// Funções de Matrícula
// =========================================================================

export const matricularAluno = async (
  data: MatriculaCreateData
): Promise<Matricula> => {
  const existe = await prisma.matricula.findUnique({
    where: {
      alunoId_disciplinaId: {
        alunoId: data.alunoId,
        disciplinaId: data.disciplinaId,
      },
    },
  });

  if (existe) throw new Error("O aluno já está matriculado nesta disciplina.");

  return prisma.matricula.create({
    data,
    include: { aluno: true, disciplina: true },
  });
};

export const getAllMatriculas = async (): Promise<Matricula[]> => {
  return prisma.matricula.findMany({
    include: { aluno: true, disciplina: true },
  });
};

export const getDisciplinasByAlunoId = async (
  alunoId: number
): Promise<Matricula[]> => {
  return prisma.matricula.findMany({
    where: { alunoId },
    include: { disciplina: true },
  });
};

export const desmatricularAluno = async (
  alunoId: number,
  disciplinaId: number
): Promise<Matricula> => {
  return prisma.matricula.delete({
    where: {
      alunoId_disciplinaId: {
        alunoId,
        disciplinaId,
      },
    },
  });
};
