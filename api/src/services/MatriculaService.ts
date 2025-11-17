// src/services/MatriculaService.ts

import { prisma } from "../database/prisma";
import { Matricula, Aluno, Disciplina } from "@prisma/client";

// --- Definição de Tipos ---

interface MatriculaCreateData {
  alunoId: number;
  disciplinaId: number;
}

// --- Funções de Matrícula ---

/**
 * Realiza a matrícula de um aluno em uma disciplina específica.
 * @param data Contém os IDs do Aluno e da Disciplina.
 * @returns O registro de matrícula criado.
 */
export const matricularAluno = async (
  data: MatriculaCreateData
): Promise<Matricula> => {
  // Verifica se a matrícula já existe para evitar duplicatas
  const existe = await prisma.matricula.findUnique({
    where: {
      alunoId_disciplinaId: {
        alunoId: data.alunoId,
        disciplinaId: data.disciplinaId,
      },
    },
  });

  if (existe) {
    throw new Error("O aluno já está matriculado nesta disciplina.");
  }

  return prisma.matricula.create({
    data: data,
    include: { aluno: true, disciplina: true },
  });
};

/**
 * Retorna todas as matrículas, detalhando Aluno e Disciplina.
 * @returns Lista de todas as matrículas.
 */
export const getAllMatriculas = async (): Promise<Matricula[]> => {
  return prisma.matricula.findMany({
    include: {
      aluno: true,
      disciplina: true,
    },
  });
};

/**
 * Retorna todas as disciplinas em que um aluno está matriculado.
 * @param alunoId ID do aluno.
 * @returns Lista de matrículas do aluno.
 */
export const getDisciplinasByAlunoId = async (
  alunoId: number
): Promise<Matricula[]> => {
  return prisma.matricula.findMany({
    where: { alunoId },
    include: { disciplina: true },
  });
};

/**
 * Remove a matrícula de um aluno em uma disciplina.
 * @param alunoId ID do aluno.
 * @param disciplinaId ID da disciplina.
 * @returns O registro de matrícula removido.
 */
export const desmatricularAluno = async (
  alunoId: number,
  disciplinaId: number
): Promise<Matricula> => {
  return prisma.matricula.delete({
    where: {
      alunoId_disciplinaId: {
        alunoId: alunoId,
        disciplinaId: disciplinaId,
      },
    },
  });
};
