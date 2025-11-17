// src/controllers/TurmaController.ts

import { Request, Response } from "express";
import * as turmaService from "../services/TurmaService";
import { ZodError } from "zod";
// Importe o TurmaCreateSchema se você definiu um para validação
// import { TurmaCreateSchema } from '../services/TurmaService';

/**
 * Cria uma nova Turma (Ex: '5º Ano - Manhã').
 */
export const createTurma = async (req: Request, res: Response) => {
  try {
    // [OPCIONAL] Se houver um Zod Schema para Turma, adicione a validação aqui:
    // const validatedData = TurmaCreateSchema.parse(req.body);

    const turma = await turmaService.create(req.body);
    return res.status(201).json(turma);
  } catch (error: any) {
    if (error instanceof ZodError) {
      const zodError = error as ZodError<any>;
      return res.status(400).json({
        message: "Erro de validação de dados.",
        errors: zodError.issues,
      });
    }
    // P2002: Campo único (se o nome da turma for único) já existe
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: `Turma já existe: ${error.meta.target}` });
    }
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Retorna todas as Turmas, incluindo a contagem de alunos e as disciplinas/professores alocados.
 */
export const getAllTurmas = async (req: Request, res: Response) => {
  try {
    const turmas = await turmaService.getAll();
    return res.json(turmas);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Retorna uma Turma específica por ID.
 */
export const getTurmaById = async (req: Request, res: Response) => {
  try {
    const turma = await turmaService.getById(Number(req.params.id));

    if (!turma) {
      return res.status(404).json({ message: "Turma não encontrada." });
    }

    return res.json(turma);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Atualiza os dados de uma Turma.
 */
export const updateTurma = async (req: Request, res: Response) => {
  try {
    const turma = await turmaService.update(Number(req.params.id), req.body);
    return res.json(turma);
  } catch (error: any) {
    // P2025: Registro não encontrado para atualização
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Turma não encontrada." });
    }
    // P2002: Campo único já existe
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: `Turma já existe: ${error.meta.target}` });
    }
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Remove uma Turma.
 */
export const deleteTurma = async (req: Request, res: Response) => {
  try {
    await turmaService.remove(Number(req.params.id));
    return res.status(204).send(); // HTTP 204: Sucesso, sem conteúdo
  } catch (error: any) {
    // P2025: Registro não encontrado para deleção
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Turma não encontrada." });
    }
    // P2003: Falha na restrição de chave estrangeira (a turma tem alunos ou professores/disciplinas)
    if (error.code === "P2003") {
      return res.status(409).json({
        message:
          "Não é possível remover: A turma ainda possui alunos ou associações ativas.",
      });
    }
    return res.status(500).json({ message: error.message });
  }
};
