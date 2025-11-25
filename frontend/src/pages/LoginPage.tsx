import React, { useState, useCallback } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Mail, Lock, AutoAwesome, LockOpen } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/LoginHooks";

// =========================================================================
// 1. Tipagem
// =========================================================================
type UserRole = "ALUNO" | "PROFESSOR" | "SECRETARIO";

interface UserType {
  id: number;
  email: string;
  nome: string;
  token: string;
  role: UserRole;
}

// =========================================================================
// 2. Funções auxiliares
// =========================================================================
const validateLogin = (data: Record<string, string>) => {
  const errors: Record<string, string> = {};
  if (!data.email) errors.email = "O e-mail é obrigatório.";
  if (!data.senha) errors.senha = "A senha é obrigatória.";

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
};

const getRedirectPath = (role: UserRole): string => {
  switch (role) {
    case "ALUNO":
      return "/aluno";
    case "PROFESSOR":
      return "/professor";
    case "SECRETARIO":
    default:
      return "/home";
  }
};

// =========================================================================
// 3. Componente LoginPage
// =========================================================================
export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [formData, setFormData] = useState({ email: "", senha: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msgSucesso, setMsgSucesso] = useState<string>("");
  const [msgErro, setMsgErro] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLogged, setIsLogged] = useState<boolean>(false);

  const LockIcon = isLogged ? LockOpen : Lock;
  const LockIconColor = isLogged ? "secondary.main" : "text.secondary";

  // =========================================================================
  // 4. Handlers
  // =========================================================================
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const newValue = name === "email" ? value.toLowerCase() : value;
      setFormData((prev) => ({ ...prev, [name]: newValue }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
      setMsgErro("");
      setMsgSucesso("");
      setIsLogged(false);
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const validation = validateLogin(formData);
      if (!validation.success) {
        setErrors(validation.errors);
        setMsgErro("Preencha todos os campos antes de lançar o feitiço.");
        return;
      }

      setIsLoading(true);
      setMsgErro("");
      setMsgSucesso("");
      setIsLogged(false);

      try {
        const normalizedEmail = formData.email.toLowerCase();
        await signIn({ email: normalizedEmail, password: formData.senha });

        const userJson = localStorage.getItem("@App:user");
        const usuarioLogado = userJson
          ? (JSON.parse(userJson) as UserType)
          : null;

        if (!usuarioLogado || !usuarioLogado.role)
          throw new Error(
            "Usuário autenticado, mas o perfil não foi encontrado."
          );

        const nomeUsuario = usuarioLogado.nome || "Bruxo(a)";
        const userRole = usuarioLogado.role;
        const redirectPath = getRedirectPath(userRole);

        setMsgSucesso(
          `Bem-vindo(a) ao Salão Comunal, ${nomeUsuario}! (Perfil: ${userRole.toUpperCase()})`
        );
        setIsLogged(true);

        setTimeout(() => navigate(redirectPath), 1500);
      } catch (error: any) {
        console.error("Erro no login:", error);
        setMsgErro(
          error.message?.includes("Credenciais") ||
            error.message?.includes("401")
            ? "Feitiço falhou. Verifique suas credenciais mágicas."
            : `Ocorreu um erro inesperado na Câmara Secreta: ${error.message}`
        );
        setIsLogged(false);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, signIn, navigate]
  );

  // =========================================================================
  // 5. JSX
  // =========================================================================
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url('/public/hogwarts.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        overflow: "hidden",
      }}
    >
      <Paper
        elevation={10}
        sx={{
          padding: 4,
          maxWidth: 400,
          width: "90%",
          borderRadius: 3,
          backgroundColor: "rgba(14, 14, 14, 0.95)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(238, 186, 48, 0.4)",
          transition: "all 0.3s ease-in-out",
          transform: isLogged ? "scale(1.05)" : "scale(1)",
        }}
      >
        <Box textAlign="center" mb={4}>
          <AutoAwesome sx={{ fontSize: 40, color: "secondary.main", mb: 1 }} />
          <Typography
            variant="h5"
            component="h1"
            fontWeight="bold"
            color="secondary.light"
          >
            Entrada no Salão Comunal
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Insira seu e-mail e sua senha mágica.
          </Typography>
        </Box>

        {(msgSucesso || msgErro) && (
          <Box mb={2}>
            <Alert
              severity={msgErro ? "error" : "success"}
              sx={{
                backgroundColor: msgErro
                  ? "rgba(255, 0, 0, 0.1)"
                  : "rgba(0, 255, 0, 0.1)",
                color: msgErro ? "error.main" : "success.main",
              }}
            >
              {msgSucesso || msgErro}
            </Alert>
          </Box>
        )}

        <Box component="form" noValidate onSubmit={handleSubmit}>
          <TextField
            label="Coruja Eletrônica (E-mail)"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleInputChange}
            error={!!errors.email}
            helperText={errors.email}
            disabled={isLoading || isLogged}
            variant="filled"
            sx={{
              mb: 3,
              "& .MuiInputBase-input": {
                textTransform: "lowercase !important",
              },
            }}
            InputProps={{
              startAdornment: (
                <Box sx={{ display: "flex", alignItems: "center", mt: 2.5 }}>
                  <Mail sx={{ color: "text.secondary", mr: 1 }} />
                </Box>
              ),
            }}
          />

          <TextField
            label="Senha (Feitiço Secreto)"
            name="senha"
            type="password"
            fullWidth
            margin="normal"
            value={formData.senha}
            onChange={handleInputChange}
            error={!!errors.senha}
            helperText={errors.senha}
            disabled={isLoading || isLogged}
            variant="filled"
            InputProps={{
              startAdornment: (
                <Box sx={{ display: "flex", alignItems: "center", mt: 2.5 }}>
                  <LockIcon
                    sx={{
                      color: LockIconColor,
                      mr: 1,
                      transition: "color 0.5s",
                    }}
                  />
                </Box>
              ),
            }}
            sx={{ mb: 1 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ mt: 4, py: 1.5, fontWeight: "bold" }}
            disabled={isLoading || isLogged}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Lançar Feitiço"
            )}
          </Button>

          <Typography
            variant="caption"
            display="block"
            align="center"
            mt={2}
            color="text.disabled"
          >
            O Mapa do Maroto requer discrição.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
