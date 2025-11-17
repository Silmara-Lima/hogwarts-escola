import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import * as disciplinaController from "../controllers/DisciplinaController";

const router = Router();

// Apenas Secretário pode gerenciar o currículo (Disciplinas)
const GESTAO_DISCIPLINA: any = ["SECRETARIO"];
// Todos podem consultar o currículo
const CONSULTA_DISCIPLINA: any = ["SECRETARIO", "PROFESSOR", "ALUNO"];

router.post(
  "/",
  authenticate,
  authorize(GESTAO_DISCIPLINA),
  disciplinaController.createDisciplina
);
router.get(
  "/",
  authenticate,
  authorize(CONSULTA_DISCIPLINA),
  disciplinaController.getAllDisciplinas
);
router.get(
  "/:id",
  authenticate,
  authorize(CONSULTA_DISCIPLINA),
  disciplinaController.getDisciplinaById
);
router.put(
  "/:id",
  authenticate,
  authorize(GESTAO_DISCIPLINA),
  disciplinaController.updateDisciplina
);
router.delete(
  "/:id",
  authenticate,
  authorize(GESTAO_DISCIPLINA),
  disciplinaController.deleteDisciplina
);

export default router;
