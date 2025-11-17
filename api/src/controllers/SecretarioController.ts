// src/controllers/SecretarioController.ts (Versão Corrigida para Linter TS)

import { Request, Response } from "express";
import * as secretarioService from "../services/SecretarioService";
import * as bcrypt from "bcryptjs";
import { ZodError } from "zod"; // Importe o ZodError
import {
  AlunoCreateSchema,
  ProfessorCreateSchema,
} from "../services/SecretarioService";
import { ZodIssue } from "zod"; // Importe o tipo ZodIssue para melhor tipagem

const SALT_ROUNDS = 10;

/**
 * Cria um novo Aluno no sistema.
 */
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
      // CORREÇÃO: Usamos o tipo ZodError para acessar 'issues'
      const zodError = error as ZodError<any>; // Type Assertion
      return res.status(400).json({
        message: "Erro de validação de dados.",
        errors: zodError.issues, // TS agora sabe que 'issues' existe
      });
    }

    // Erro P2002: Campo único (email, cpf) já existe
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: `Campo único já existe: ${error.meta.target}` });
    }
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Cria um novo Professor no sistema.
 */
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
      // CORREÇÃO: Type Assertion
      const zodError = error as ZodError<any>;
      return res.status(400).json({
        message: "Erro de validação de dados.",
        errors: zodError.issues,
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
