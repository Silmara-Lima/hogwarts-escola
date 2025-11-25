import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import * as turmaController from "../controllers/TurmaController";

const router = Router();

// =========================================================================
// ROTAS DE TURMAS
// =========================================================================
const GESTAO_TURMA: any = ["SECRETARIO"];
const CONSULTA_TURMA: any = ["SECRETARIO", "PROFESSOR"];

router.post(
  "/",
  authenticate,
  authorize(GESTAO_TURMA),
  turmaController.createTurma
);
router.get(
  "/",
  authenticate,
  authorize(CONSULTA_TURMA),
  turmaController.getAllTurmas
);
router.get(
  "/:id",
  authenticate,
  authorize(CONSULTA_TURMA),
  turmaController.getTurmaById
);
router.put(
  "/:id",
  authenticate,
  authorize(GESTAO_TURMA),
  turmaController.updateTurma
);
router.delete(
  "/:id",
  authenticate,
  authorize(GESTAO_TURMA),
  turmaController.deleteTurma
);

export default router;
