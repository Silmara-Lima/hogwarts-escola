import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import * as secretarioController from "../controllers/SecretarioController";

const router = Router();

// Todas as rotas de criação de usuários são restritas ao SECRETARIO
const SECRETARIO: any = ["SECRETARIO"];

// Rota para criar um novo Aluno
router.post(
  "/alunos",
  authenticate,
  authorize(SECRETARIO),
  secretarioController.createAluno
);

// Rota para criar um novo Professor
router.post(
  "/professores",
  authenticate,
  authorize(SECRETARIO),
  secretarioController.createProfessor
);

export default router;
