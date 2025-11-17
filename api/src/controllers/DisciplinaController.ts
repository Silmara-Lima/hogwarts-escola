// src/controllers/DisciplinaController.ts

import { Request, Response } from "express";
import * as disciplinaService from "../services/DisciplinaService";
import { ZodError } from "zod"; // Para validação, se aplicável

/**
 * Cria uma nova Disciplina (Restrita ao Secretário).
 */
export const createDisciplina = async (req: Request, res: Response) => {
  try {
    // [OPCIONAL] Adicionar validação Zod aqui.

    const disciplina = await disciplinaService.create(req.body);
    return res.status(201).json(disciplina);
  } catch (error: any) {
    if (error instanceof ZodError) {
      const zodError = error as ZodError<any>;
      return res.status(400).json({
        message: "Erro de validação de dados.",
        errors: zodError.issues,
      });
    }
    // P2002: Campo único (nome da disciplina) já existe
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: `Disciplina já existe: ${error.meta.target}` });
    }
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Retorna todas as Disciplinas.
 */
export const getAllDisciplinas = async (req: Request, res: Response) => {
  try {
    const disciplinas = await disciplinaService.getAll();
    return res.json(disciplinas);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Retorna uma Disciplina pelo ID.
 */
export const getDisciplinaById = async (req: Request, res: Response) => {
  try {
    const disciplina = await disciplinaService.getById(Number(req.params.id));

    if (!disciplina) {
      return res.status(404).json({ message: "Disciplina não encontrada." });
    }

    return res.json(disciplina);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Atualiza os dados de uma Disciplina (Restrita ao Secretário).
 */
export const updateDisciplina = async (req: Request, res: Response) => {
  try {
    const disciplina = await disciplinaService.update(
      Number(req.params.id),
      req.body
    );
    return res.json(disciplina);
  } catch (error: any) {
    // P2025: Registro não encontrado para atualização
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Disciplina não encontrada." });
    }
    // P2002: Campo único já existe
    if (error.code === "P2002") {
      return res.status(409).json({
        message: `Nome da Disciplina já existe: ${error.meta.target}`,
      });
    }
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Remove uma Disciplina (Restrita ao Secretário).
 */
export const deleteDisciplina = async (req: Request, res: Response) => {
  try {
    await disciplinaService.remove(Number(req.params.id));
    return res.status(204).send(); // HTTP 204: Sucesso, sem conteúdo
  } catch (error: any) {
    // P2025: Registro não encontrado para deleção
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Disciplina não encontrada." });
    }
    // P2003: Falha na restrição de chave estrangeira (a disciplina possui alunos matriculados ou professores alocados)
    if (error.code === "P2003") {
      return res.status(409).json({
        message:
          "Não é possível remover: A disciplina ainda possui alunos matriculados ou professores alocados.",
      });
    }
    return res.status(500).json({ message: error.message });
  }
};
