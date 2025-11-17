import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import * as professorController from "../controllers/ProfessorController";

const router = Router();

// Funções permitidas: Secretário (gestão) e Professor (consulta de dados próprios)
const GESTAO_PROFESSOR: any = ["SECRETARIO"];
const CONSULTA_PROFESSOR: any = ["SECRETARIO", "PROFESSOR"];

// CRUD Básico (Geralmente restrito ao Secretário)
router.get(
  "/",
  authenticate,
  authorize(CONSULTA_PROFESSOR),
  professorController.getAllProfessores
);
router.get(
  "/:id",
  authenticate,
  authorize(CONSULTA_PROFESSOR),
  professorController.getProfessorById
);
router.put(
  "/:id",
  authenticate,
  authorize(GESTAO_PROFESSOR),
  professorController.updateProfessor
);
router.delete(
  "/:id",
  authenticate,
  authorize(GESTAO_PROFESSOR),
  professorController.deleteProfessor
);

// Rota de Negócio: Retorna a lista de alunos do professor (Consulta Essencial)
router.get(
  "/:id/alunos",
  authenticate,
  authorize(CONSULTA_PROFESSOR),
  professorController.getAlunosByProfessor
);

export default router;
