// =========================================================================
// optionRoutes.ts - Rotas para carregar metadados/opções do sistema
// =========================================================================

import { Router } from "express";
import { getOptions } from "../controllers/OptionController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

// GET /api/options
// Retorna listas de turmas, disciplinas e casas para formulários e filtros
router.get(
  "/",
  authenticate,
  authorize(["PROFESSOR", "SECRETARIO"]), // Apenas professores e secretários podem acessar
  getOptions
);

export default router;
