import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import * as matriculaController from "../controllers/MatriculaController";

const router = Router();

// Matrícula é uma operação de Secretário
const GESTAO_MATRICULA: any = ["SECRETARIO"];
// Consulta de todas as matrículas
const CONSULTA_MATRICULA: any = ["SECRETARIO", "PROFESSOR"];
// Aluno só pode ver as suas próprias matrículas
const CONSULTA_ALUNO: any = ["SECRETARIO", "ALUNO"];

// Criação/Remoção de Matrícula
router.post(
  "/",
  authenticate,
  authorize(GESTAO_MATRICULA),
  matriculaController.matricularAluno
);
router.delete(
  "/:alunoId/:disciplinaId",
  authenticate,
  authorize(GESTAO_MATRICULA),
  matriculaController.desmatricularAluno
);

// Consulta Geral
router.get(
  "/",
  authenticate,
  authorize(CONSULTA_MATRICULA),
  matriculaController.getAllMatriculas
);

// Consulta Específica (usada pelo aluno para ver seu próprio currículo)
router.get(
  "/aluno/:id/disciplinas",
  authenticate,
  authorize(CONSULTA_ALUNO),
  matriculaController.getDisciplinasByAlunoId
);

// ** NOTA: A rota de ATUALIZAÇÃO DE NOTA será adicionada no ProfessorController ou em um GradesController, se necessário.

export default router;
