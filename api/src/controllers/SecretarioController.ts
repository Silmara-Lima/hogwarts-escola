// =========================================================================
// SecretarioController
// =========================================================================

import { Request, Response } from "express";
import * as secretarioService from "../services/SecretarioService";
import * as bcrypt from "bcryptjs";
import { ZodError, z } from "zod";
import {
  AlunoCreateSchema,
  ProfessorCreateSchema,
} from "../services/SecretarioService";

const SALT_ROUNDS = 10;

// =========================================================================
// getDashboardStats (GET /api/secretario/dashboard)
// =========================================================================
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await secretarioService.getDashboardStats();
    return res.json(stats);
  } catch (error: any) {
    console.error("Erro ao buscar estatísticas do dashboard:", error);
    return res
      .status(500)
      .json({ message: "Falha ao carregar dados do dashboard." });
  }
};

// =========================================================================
// createAluno (POST /api/secretario/alunos)
// =========================================================================
export const createAluno = async (req: Request, res: Response) => {
  try {
    const validatedData = AlunoCreateSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(validatedData.senha, SALT_ROUNDS);

    const aluno = await secretarioService.createAluno({
      ...validatedData,
      senha: hashedPassword,
    });

    const { senha, ...alunoResponse } = aluno;
    return res.status(201).json(alunoResponse);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Erro de validação de dados.",
        errors: error.issues,
      });
    }
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: `Campo único já existe: ${error.meta.target}` });
    }
    return res.status(500).json({ message: error.message });
  }
};

// =========================================================================
// createProfessor (POST /api/secretario/professores)
// =========================================================================
export const createProfessor = async (req: Request, res: Response) => {
  try {
    const validatedData = ProfessorCreateSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(validatedData.senha, SALT_ROUNDS);

    const professor = await secretarioService.createProfessor({
      ...validatedData,
      senha: hashedPassword,
    });

    const { senha, ...professorResponse } = professor;
    return res.status(201).json(professorResponse);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Erro de validação de dados.",
        errors: error.issues,
      });
    }
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: `Campo único já existe: ${error.meta.target}` });
    }
    return res.status(500).json({ message: error.message });
  }
};

// =========================================================================
// createDisciplina (POST /api/secretario/disciplinas)
// =========================================================================
const createDisciplinaControllerSchema = z.object({
  nome: z.string().min(2, "Nome da disciplina inválido."),
  cargaHoraria: z
    .number()
    .int("Carga horária deve ser um número inteiro.")
    .positive("Carga horária inválida."),
  eObrigatoria: z.boolean(),
});

export const createDisciplina = async (req: Request, res: Response) => {
  try {
    const { nome, cargaHoraria, eObrigatoria } =
      createDisciplinaControllerSchema.parse(req.body);

    const disciplina = await secretarioService.createDisciplina(
      nome,
      cargaHoraria,
      eObrigatoria
    );

    return res.status(201).json(disciplina);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Erro de validação de dados da disciplina.",
        errors: error.issues,
      });
    }
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: `Disciplina já existe: ${error.meta.target}` });
    }
    console.error("Erro ao criar disciplina:", error);
    return res.status(500).json({ message: "Falha ao criar disciplina." });
  }
};
