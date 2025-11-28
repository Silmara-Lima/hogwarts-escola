import { Router } from "express";
import {
  authenticate,
  authorize,
  UserRole,
} from "../middlewares/authMiddleware";

import * as secretarioController from "../controllers/SecretarioController";
import alunoRoutes from "./alunoRoutes";

const router = Router();

const SECRETARIO: UserRole[] = ["SECRETARIO"];

// =========================================================================
// 1. Dashboard do Secretário
// =========================================================================
router.get(
  "/dashboard",
  authenticate,
  authorize(SECRETARIO),
  secretarioController.getDashboardStats
);

// =========================================================================
// 2. CRUD de alunos (usa alunoRoutes)
// =========================================================================
router.use("/alunos", authenticate, authorize(SECRETARIO), alunoRoutes);

// =========================================================================
// 3. Professores NÃO FICAM AQUI
// Pois todas as rotas de professor já estão em /api/professores
// =========================================================================

export default router;
