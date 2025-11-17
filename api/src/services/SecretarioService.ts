import { prisma } from "../database/prisma";
import { Aluno, Professor } from "@prisma/client";
import { z } from "zod";

// --- 1. SCHEMAS ZOD (Definição para Validação) ---

// Schema de criação de Aluno (Reutilizando a estrutura necessária)
export const AlunoCreateSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  cpf: z.string().length(11),
  senha: z.string().min(6), // A senha deve ser hashed no controller antes de ser passada aqui!
  casaId: z.number().int(),
  turmaId: z.number().int(),
});

// Tipo derivado do Zod para Aluno
type AlunoCreateInput = z.infer<typeof AlunoCreateSchema>;

// Schema de criação de Professor
export const ProfessorCreateSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  cpf: z.string().length(11),
  senha: z.string().min(6), // A senha deve ser hashed no controller
});

// Tipo derivado do Zod para Professor
type ProfessorCreateInput = z.infer<typeof ProfessorCreateSchema>;

// --- 2. MÉTODOS DE GESTÃO ---

/**
 * Cria um novo Aluno.
 * @param data Dados do aluno validados.
 * @returns O aluno criado.
 */
export const createAluno = async (data: AlunoCreateInput): Promise<Aluno> => {
  // Nota: A validação Zod deve ser feita no Controller/Rota
  // E a senha já deve ter sido hashed (ex: usando bcrypt) antes de chegar aqui.
  return prisma.aluno.create({
    data: data,
  });
};

/**
 * Cria um novo Professor.
 * @param data Dados do professor validados.
 * @returns O professor criado.
 */
export const createProfessor = async (
  data: ProfessorCreateInput
): Promise<Professor> => {
  // A senha já deve ter sido hashed.
  return prisma.professor.create({
    data: data,
  });
};

/**
 * Cadastra uma nova Disciplina.
 * @param nome Nome da disciplina.
 * @returns A disciplina criada.
 */
export const createDisciplina = async (nome: string) => {
  return prisma.disciplina.create({
    data: { nome },
  });
};
