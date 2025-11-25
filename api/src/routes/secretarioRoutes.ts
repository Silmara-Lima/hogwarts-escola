import { Router } from "express";
import {
  authenticate,
  authorize,
  UserRole,
} from "../middlewares/authMiddleware";
import * as secretarioController from "../controllers/SecretarioController";
import alunoRoutes from "./alunoRoutes";

const router = Router();

// =========================================================================
// ROTAS DO SECRETÁRIO
// =========================================================================
const SECRETARIO: UserRole[] = ["SECRETARIO"];

// Dashboard
router.get(
  "/dashboard",
  authenticate,
  authorize(SECRETARIO),
  secretarioController.getDashboardStats
);

// Alunos
router.use("/alunos", alunoRoutes);

// Professores
router.post(
  "/professores",
  authenticate,
  authorize(SECRETARIO),
  secretarioController.createProfessor
);

export default router;
