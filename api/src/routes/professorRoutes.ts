// =========================================================================
// professorRoutes.ts - Rotas CRUD e específicas para Professores
// =========================================================================

import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import * as professorController from "../controllers/ProfessorController";

const router = Router();

// =========================================================================
// PERMISSÕES
// =========================================================================
const GESTAO_PROFESSOR: string[] = ["SECRETARIO"];
const CONSULTA_PROFESSOR: string[] = ["SECRETARIO", "PROFESSOR"];

// =========================================================================
// ROTAS ESPECÍFICAS
// =========================================================================

// Detalhes do professor logado
router.get(
  "/me",
  authenticate,
  authorize(CONSULTA_PROFESSOR),
  professorController.getMeDetails
);

// Detalhes completos por ID (Painel do Secretário/Admin)
router.get(
  "/:id/details",
  authenticate,
  authorize(CONSULTA_PROFESSOR),
  professorController.getProfessorDetails
);

// Lista de alunos de um professor
router.get(
  "/:id/alunos",
  authenticate,
  authorize(CONSULTA_PROFESSOR),
  professorController.getAlunosByProfessor
);

// Vincular disciplinas a um professor
router.patch(
  "/:id/disciplinas",
  authenticate,
  authorize(GESTAO_PROFESSOR),
  professorController.vincularDisciplinasDoProfessor
);

// =========================================================================
// ROTAS CRUD PADRÃO
// =========================================================================

// Listar todos os professores
router.get(
  "/",
  authenticate,
  authorize(CONSULTA_PROFESSOR),
  professorController.getAllProfessores
);

// Criar novo professor
router.post(
  "/",
  authenticate,
  authorize(GESTAO_PROFESSOR),
  professorController.createProfessor
);

// Dados básicos de um professor
router.get(
  "/:id",
  authenticate,
  authorize(CONSULTA_PROFESSOR),
  professorController.getProfessorById
);

// Atualizar professor
router.put(
  "/:id",
  authenticate,
  authorize(GESTAO_PROFESSOR),
  professorController.updateProfessor
);

// Remover professor
router.delete(
  "/:id",
  authenticate,
  authorize(GESTAO_PROFESSOR),
  professorController.deleteProfessor
);

export default router;
