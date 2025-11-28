// =========================================================================
// indexRoutes.ts - Centralizador de todas as rotas da API
// =========================================================================

import { Router } from "express";

import authRoutes from "./authRoutes";
import optionRoutes from "./optionRoutes";
import professorRoutes from "./professorRoutes";
import secretarioRoutes from "./secretarioRoutes";
import turmaRoutes from "./turmaRoutes";
import disciplinaRoutes from "./disciplinaRoutes";
import matriculaRoutes from "./matriculaRoutes";
import casaRoutes from "./casaRoutes";

import * as AlunoController from "../controllers/AlunoController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

// =========================================================================
// ROTAS PÚBLICAS
// =========================================================================

// /api/auth/...
router.use("/auth", authRoutes);

// =========================================================================
// ROTAS DE GESTÃO (SECRETARIO)
// =========================================================================

// /api/secretario/alunos
// /api/secretario/professores (CREATE)
// /api/secretario/dashboard
router.use("/secretario", secretarioRoutes);

// =========================================================================
// ROTAS DE PROFESSOR (CRUD + específicas)
// =========================================================================

// /api/professores/...
router.use("/professores", professorRoutes);

// =========================================================================
// ROTAS DO ALUNO LOGADO
// =========================================================================

router.get(
  "/aluno/info",
  authenticate,
  authorize(["ALUNO"]),
  AlunoController.getAlunoInfo
);

// =========================================================================
// ROTAS ACADÊMICAS
// =========================================================================

router.use("/turmas", turmaRoutes);
router.use("/disciplinas", disciplinaRoutes);
router.use("/matriculas", matriculaRoutes);
router.use("/casas", casaRoutes);

// =========================================================================
// ROTAS DE OPÇÕES (Selects, dropdowns, metadados)
// =========================================================================

router.use("/options", optionRoutes);

export default router;
