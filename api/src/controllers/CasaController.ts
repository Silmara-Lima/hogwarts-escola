// =========================================================================
// CasaController
// =========================================================================

import { Request, Response } from "express";
import * as casaService from "../services/CasaService";
import { ZodError } from "zod";

// =========================================================================
// createCasa (POST /casas)
// =========================================================================
export const createCasa = async (req: Request, res: Response) => {
  try {
    const casa = await casaService.create(req.body);
    return res.status(201).json(casa);
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
        .json({ message: `Casa já existe: ${error.meta.target}` });
    }
    return res.status(500).json({ message: error.message });
  }
};

// =========================================================================
// getAllCasas (GET /casas)
// =========================================================================
export const getAllCasas = async (req: Request, res: Response) => {
  try {
    const casas = await casaService.getAll();
    return res.json(casas);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================================================================
// getCasaById (GET /casas/:id)
// =========================================================================
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

// =========================================================================
// updateCasa (PATCH /casas/:id)
// =========================================================================
export const updateCasa = async (req: Request, res: Response) => {
  try {
    const casa = await casaService.update(Number(req.params.id), req.body);
    return res.json(casa);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Casa não encontrada." });
    }
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: `Nome da Casa já existe: ${error.meta.target}` });
    }
    return res.status(500).json({ message: error.message });
  }
};

// =========================================================================
// deleteCasa (DELETE /casas/:id)
// =========================================================================
export const deleteCasa = async (req: Request, res: Response) => {
  try {
    await casaService.remove(Number(req.params.id));
    return res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Casa não encontrada." });
    }
    if (error.code === "P2003") {
      return res.status(409).json({
        message:
          "Não é possível remover: A Casa ainda possui alunos vinculados.",
      });
    }
    return res.status(500).json({ message: error.message });
  }
};
