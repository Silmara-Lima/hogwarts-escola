// src/controllers/CasaController.ts

import { Request, Response } from "express";
import * as casaService from "../services/CasaService";
import { ZodError } from "zod"; // Para validação, se aplicável

/**
 * Cria uma nova Casa. Geralmente restrito ao Secretário ou usado apenas no Seed.
 */
export const createCasa = async (req: Request, res: Response) => {
  try {
    // [OPCIONAL] Adicionar validação Zod aqui.

    const casa = await casaService.create(req.body);
    return res.status(201).json(casa);
  } catch (error: any) {
    if (error instanceof ZodError) {
      const zodError = error as ZodError<any>;
      return res.status(400).json({
        message: "Erro de validação de dados.",
        errors: zodError.issues,
      });
    }
    // P2002: Campo único (se o nome da casa for único) já existe
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: `Casa já existe: ${error.meta.target}` });
    }
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Retorna todas as Casas, incluindo a contagem de alunos e detalhes.
 */
export const getAllCasas = async (req: Request, res: Response) => {
  try {
    const casas = await casaService.getAll();
    return res.json(casas);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Retorna uma Casa pelo ID, incluindo todos os alunos associados.
 */
export const getCasaById = async (req: Request, res: Response) => {
  try {
    const casa = await casaService.getById(Number(req.params.id));

    if (!casa) {
      return res.status(404).json({ message: "Casa não encontrada." });
    }

    return res.json(casa);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Atualiza os dados de uma Casa.
 */
export const updateCasa = async (req: Request, res: Response) => {
  try {
    const casa = await casaService.update(Number(req.params.id), req.body);
    return res.json(casa);
  } catch (error: any) {
    // P2025: Registro não encontrado para atualização
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Casa não encontrada." });
    }
    // P2002: Campo único já existe
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: `Nome da Casa já existe: ${error.meta.target}` });
    }
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Remove uma Casa.
 */
export const deleteCasa = async (req: Request, res: Response) => {
  try {
    await casaService.remove(Number(req.params.id));
    return res.status(204).send(); // HTTP 204: Sucesso, sem conteúdo
  } catch (error: any) {
    // P2025: Registro não encontrado para deleção
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Casa não encontrada." });
    }
    // P2003: Falha na restrição de chave estrangeira (a casa tem alunos vinculados)
    if (error.code === "P2003") {
      return res.status(409).json({
        message:
          "Não é possível remover: A Casa ainda possui alunos vinculados.",
      });
    }
    return res.status(500).json({ message: error.message });
  }
};
