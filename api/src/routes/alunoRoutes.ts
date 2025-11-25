// =========================================================================
// alunoRoutes (SECRETARIA)
// =========================================================================

import { Router } from "express";
import * as AlunoController from "../controllers/AlunoController";
import {
  authenticate,
  authorize,
  UserRole,
} from "../middlewares/authMiddleware";

const router = Router();
const SECRETARIO: UserRole[] = ["SECRETARIO"];

// =========================================================================
// ROTAS DE SECRETARIA (CRUD)
// =========================================================================

// 1. LISTAGEM DE ALUNOS
router.get(
  "/",
  authenticate,
  authorize(SECRETARIO),
  AlunoController.getAllAlunos
);

// 2. CRIAÇÃO DE ALUNO
router.post(
  "/",
  authenticate,
  authorize(SECRETARIO),
  AlunoController.createAluno
);

// 3. DETALHES DE ALUNO
router.get(
  "/:id",
  authenticate,
  authorize(SECRETARIO),
  AlunoController.getAlunoById
);

// 4. ATUALIZAÇÃO DE ALUNO
router.patch(
  "/:id",
  authenticate,
  authorize(SECRETARIO),
  AlunoController.updateAluno
);

// 5. EXCLUSÃO DE ALUNO
router.delete(
  "/:id",
  authenticate,
  authorize(SECRETARIO),
  AlunoController.deleteAluno
);

export default router;
