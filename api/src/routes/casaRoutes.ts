// =========================================================================
// casaRoutes.ts - Rotas CRUD para Casas
// =========================================================================

import { Router } from "express";
import {
  authenticate,
  authorize,
  UserRole,
} from "../middlewares/authMiddleware";
import * as casaController from "../controllers/CasaController";

const router = Router();

// =========================================================================
// ROLES
// =========================================================================
// Apenas Secretário pode gerenciar Casas (CRUD)
// CORREÇÃO: Tipando explicitamente para UserRole[]
const GESTAO_CASA: UserRole[] = ["SECRETARIO"];

// Todos podem consultar a lista de Casas (para relatórios ou alocação)
// CORREÇÃO: Tipando explicitamente para UserRole[]
const CONSULTA_CASA: UserRole[] = ["SECRETARIO", "PROFESSOR", "ALUNO"];

// =========================================================================
// ROTAS CRUD
// =========================================================================

// Criar Casa
router.post(
  "/",
  authenticate,
  authorize(GESTAO_CASA),
  casaController.createCasa
);

// Listar todas as Casas
router.get(
  "/",
  authenticate,
  authorize(CONSULTA_CASA),
  casaController.getAllCasas
);

// Buscar Casa por ID
router.get(
  "/:id",
  authenticate,
  authorize(CONSULTA_CASA),
  casaController.getCasaById
);

// Atualizar Casa
router.put(
  "/:id",
  authenticate,
  authorize(GESTAO_CASA),
  casaController.updateCasa
);

// Remover Casa
router.delete(
  "/:id",
  authenticate,
  authorize(GESTAO_CASA),
  casaController.deleteCasa
);

export default router;
