import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import * as casaController from "../controllers/CasaController";

const router = Router();

// Apenas Secretário pode gerenciar Casas (CRUD)
const GESTAO_CASA: any = ["SECRETARIO"];
// Todos podem consultar a lista de Casas (para relatórios ou alocação)
const CONSULTA_CASA: any = ["SECRETARIO", "PROFESSOR", "ALUNO"];

router.post(
  "/",
  authenticate,
  authorize(GESTAO_CASA),
  casaController.createCasa
);
router.get(
  "/",
  authenticate,
  authorize(CONSULTA_CASA),
  casaController.getAllCasas
);
router.get(
  "/:id",
  authenticate,
  authorize(CONSULTA_CASA),
  casaController.getCasaById
);
router.put(
  "/:id",
  authenticate,
  authorize(GESTAO_CASA),
  casaController.updateCasa
);
router.delete(
  "/:id",
  authenticate,
  authorize(GESTAO_CASA),
  casaController.deleteCasa
);

export default router;
