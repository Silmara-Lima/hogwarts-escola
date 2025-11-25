// =========================================================================
// disciplinaRoutes.ts - Rotas CRUD e consulta para Disciplinas
// =========================================================================

import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import * as disciplinaController from "../controllers/DisciplinaController";

const router = Router();

// =========================================================================
// PERMISSÕES
// =========================================================================
const GESTAO_DISCIPLINA: string[] = ["SECRETARIO"];
const CONSULTA_DISCIPLINA: string[] = ["SECRETARIO", "PROFESSOR", "ALUNO"];

// =========================================================================
// ROTAS CRUD
// =========================================================================

// Criar nova disciplina
router.post(
  "/",
  authenticate,
  authorize(GESTAO_DISCIPLINA),
  disciplinaController.createDisciplina
);

// Listar todas as disciplinas
router.get(
  "/",
  authenticate,
  authorize(CONSULTA_DISCIPLINA),
  disciplinaController.getAllDisciplinas
);

// Obter disciplina por ID
router.get(
  "/:id",
  authenticate,
  authorize(CONSULTA_DISCIPLINA),
  disciplinaController.getDisciplinaById
);

// Atualizar disciplina
router.put(
  "/:id",
  authenticate,
  authorize(GESTAO_DISCIPLINA),
  disciplinaController.updateDisciplina
);

// Remover disciplina
router.delete(
  "/:id",
  authenticate,
  authorize(GESTAO_DISCIPLINA),
  disciplinaController.deleteDisciplina
);

export default router;
