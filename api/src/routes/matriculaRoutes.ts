// =========================================================================
// matriculaRoutes.ts - Rotas de Matrículas (CRUD e consulta)
// =========================================================================

import { Router } from "express";
import {
  authenticate,
  authorize,
  UserRole,
} from "../middlewares/authMiddleware";
import * as matriculaController from "../controllers/MatriculaController";

const router = Router();

// =========================================================================
// PERMISSÕES
// =========================================================================
const GESTAO_MATRICULA: UserRole[] = ["SECRETARIO"];
const CONSULTA_MATRICULA: UserRole[] = ["SECRETARIO", "PROFESSOR"];
const CONSULTA_ALUNO: UserRole[] = ["SECRETARIO", "ALUNO"];

// =========================================================================
// ROTAS CRUD
// =========================================================================

// Criar matrícula de aluno em disciplina
router.post(
  "/",
  authenticate,
  authorize(GESTAO_MATRICULA),
  matriculaController.matricularAluno
);

// Remover matrícula de aluno em disciplina
router.delete(
  "/:alunoId/:disciplinaId",
  authenticate,
  authorize(GESTAO_MATRICULA),
  matriculaController.desmatricularAluno
);

// =========================================================================
// ROTAS DE CONSULTA
// =========================================================================

// Listar todas as matrículas (relatório)
router.get(
  "/",
  authenticate,
  authorize(CONSULTA_MATRICULA),
  matriculaController.getAllMatriculas
);

// Obter disciplinas de um aluno específico (para o próprio aluno ou Secretário)
router.get(
  "/aluno/:id/disciplinas",
  authenticate,
  authorize(CONSULTA_ALUNO),
  matriculaController.getDisciplinasByAlunoId
);

// ============================================================================
// NOTA:
// Atualizações de notas ou frequência podem ser implementadas em um
// GradesController ou dentro do ProfessorController, conforme regras da escola.
// ============================================================================

export default router;
