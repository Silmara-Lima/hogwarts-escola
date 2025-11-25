// =========================================================================
// authRoutes (LOGIN)
// =========================================================================

import { Router } from "express";
import { loginController } from "../controllers/AuthController";

const router = Router();

// Rota pública para login de qualquer usuário (SECRETARIO, PROFESSOR, ALUNO)
router.post("/", loginController);

export default router;
