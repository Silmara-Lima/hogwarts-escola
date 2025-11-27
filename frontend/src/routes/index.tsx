import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

import LoginPage from "../pages/LoginPage";
import { AlunoPage } from "../pages/AlunoPage";
import { ProfessorPage } from "../pages/ProfessorPage";
import { SecretarioDashboard } from "../pages/SecretarioPage";
import { SecretarioAlunosPage } from "../pages/SecretarioAlunosPage";
import { SecretarioProfessoresPage } from "../pages/SecretarioProfessoresPage";

import { useAuth } from "../hooks/LoginHooks";
import type { User } from "../types/Login";

// =========================================================================
// 1. Tipagem
// =========================================================================
type UserRole = "ALUNO" | "PROFESSOR" | "SECRETARIO";

interface UserWithRole extends User {
  role: UserRole;
}

// =========================================================================
// 2. PrivateRoute
// =========================================================================
function PrivateRoute({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children as JSX.Element;
}

// =========================================================================
// 3. DashboardRoute
// =========================================================================
function DashboardRoute() {
  const { user } = useAuth();
  const loggedUser = user as UserWithRole;
  const role = loggedUser.role;

  switch (role) {
    case "ALUNO":
      return <Navigate to="/aluno" replace />;
    case "PROFESSOR":
      return <Navigate to="/professor" replace />;
    case "SECRETARIO":
      return <Navigate to="/secretario/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

// =========================================================================
// 4. AppRoutes
// =========================================================================
export function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#0e0e0e",
        }}
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Rota Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rota raiz protegida */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardRoute />
          </PrivateRoute>
        }
      />

      {/* Rotas de Secretaria */}
      <Route
        path="/secretario"
        element={
          <PrivateRoute>
            <Outlet />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<SecretarioDashboard />} />
        <Route path="alunos" element={<SecretarioAlunosPage />} />
        <Route path="professores" element={<SecretarioProfessoresPage />} />
      </Route>

      {/* Rotas de perfil */}
      <Route
        path="/aluno"
        element={
          <PrivateRoute>
            <AlunoPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/professor"
        element={
          <PrivateRoute>
            <ProfessorPage />
          </PrivateRoute>
        }
      />

      {/* Rota fallback */}
      <Route
        path="*"
        element={<Navigate to="/secretario/dashboard" replace />}
      />
    </Routes>
  );
}
