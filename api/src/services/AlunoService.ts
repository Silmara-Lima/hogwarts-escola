// src/services/AlunoService.ts

import { prisma } from "../database/prisma";
import { Aluno, Prisma } from "@prisma/client";

// --- Definição de Tipos ---

// Tipo para dados obrigatórios na criação de um Aluno
// Excluindo 'id', 'createdAt', 'updatedAt' e usando 'nome', 'email', 'cpf', 'senha'
// Incluí 'casaId' e 'turmaId' que são chaves estrangeiras necessárias para a criação.
type AlunoCreateData = Omit<Aluno, "id" | "createdAt" | "updatedAt">;

// Tipo para dados opcionais na atualização de um Aluno
type AlunoUpdateData = Partial<AlunoCreateData>;

// --- Funções CRUD ---

/**
 * Cria um novo aluno no banco de dados.
 * @param data Dados do aluno a ser criado.
 * @returns O aluno criado.
 */
export const create = async (data: AlunoCreateData): Promise<Aluno> => {
  // Nota: Você deve garantir que 'senha' seja hashed antes de chamar esta função.
  return prisma.aluno.create({
    data,
  });
};

/**
 * Retorna todos os alunos, incluindo suas Casas e Turmas (Série/Turno).
 * @returns Lista de alunos.
 */
export const getAll = async (): Promise<Aluno[]> => {
  return prisma.aluno.findMany({
    // 'include' é usado para buscar as relações definidas no schema.prisma
    include: {
      casa: true,
      turma: true,
      matriculas: {
        include: { disciplina: true }, // Opcional: Inclui disciplinas matriculadas
      },
    },
  });
};

/**
 * Retorna um aluno pelo ID, incluindo detalhes de Casa e Turma.
 * @param id ID do aluno.
 * @returns O aluno ou null.
 */
export const getById = async (id: number): Promise<Aluno | null> => {
  return prisma.aluno.findUnique({
    where: { id },
    include: {
      casa: true,
      turma: true,
      matriculas: {
        include: { disciplina: true },
      },
    },
  });
};

/**
 * Atualiza os dados de um aluno.
 * @param id ID do aluno.
 * @param data Dados para atualização.
 * @returns O aluno atualizado.
 */
export const update = async (
  id: number,
  data: AlunoUpdateData
): Promise<Aluno> => {
  return prisma.aluno.update({
    where: { id },
    data,
  });
};

/**
 * Remove um aluno pelo ID.
 * @param id ID do aluno.
 * @returns O aluno removido.
 */
export const remove = async (id: number): Promise<Aluno> => {
  return prisma.aluno.delete({ where: { id } });
};
