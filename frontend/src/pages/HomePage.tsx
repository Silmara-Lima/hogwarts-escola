// =========================================================================
// 1. IMPORTS
// =========================================================================
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button as MuiButton,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Users, GraduationCap, Castle, LogOut } from "lucide-react";

// =========================================================================
// 2. CORES E TEMAS - HOGWARTS
// =========================================================================
const PRIMARY_HOGWARTS_RED = "#7B0F1D";
const SLYTHERIN_GREEN = "#0B4B27";
const SECONDARY_HOGWARTS_GOLD = "#D4AF37";
const BG_DEEP_STONE = "#1A1A1A";
const TEXT_ACCENT_GOLD = "#FFD700";
const TEXT_LIGHT_GRAY = "#CCCCCC";

// =========================================================================
// 3. TIPOS
// =========================================================================
interface NavButton {
  title: string;
  path: string;
  icon: React.ElementType;
  color: string;
  hover: string;
}

interface UserType {
  nome: string;
  role: "ALUNO" | "PROFESSOR" | "SECRETARIO";
}

interface ManagementButtonProps {
  button: NavButton;
  navigate: (path: string) => void;
}

// =========================================================================
// 4. SUBCOMPONENTE - BOTÃO DE NAVEGAÇÃO
// =========================================================================
const ManagementButton: React.FC<ManagementButtonProps> = ({
  button,
  navigate,
}) => (
  <MuiButton
    onClick={() => navigate(button.path)}
    fullWidth
    variant="contained"
    sx={{
      backgroundColor: button.color,
      "&:hover": {
        backgroundColor: button.hover,
        transform: "scale(1.03)",
        boxShadow: `0 0 15px ${SECONDARY_HOGWARTS_GOLD}90`,
        transition: "all 0.3s ease-out",
      },
      p: 2,
      borderRadius: 2,
      fontWeight: "bold",
      fontSize: "0.95rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      transition: "all 0.3s",
      color: "white",
      borderBottom: `3px solid ${SECONDARY_HOGWARTS_GOLD}50`,
      minHeight: "60px",
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        minWidth: 0,
      }}
    >
      <button.icon
        style={{
          width: 22,
          height: 22,
          marginRight: 12,
          color: SECONDARY_HOGWARTS_GOLD,
          flexShrink: 0,
        }}
      />
      {button.title}
    </Box>
    <Typography
      variant="caption"
      sx={{
        color: SECONDARY_HOGWARTS_GOLD,
        ml: 0.5,
        fontWeight: "bold",
        flexShrink: 0,
      }}
    >
      Acessar &rarr;
    </Typography>
  </MuiButton>
);

// =========================================================================
// 5. COMPONENTE PRINCIPAL - HOME PAGE
// =========================================================================
export default function HomePage() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState<string>("Bruxo(a)");
  const [userRole, setUserRole] = useState<UserType["role"] | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  // =========================================================================
  // 5.1 LOAD USER
  // =========================================================================
  useEffect(() => {
    const userJson = localStorage.getItem("@App:user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson) as UserType;
        setUserName(user.nome || "Bruxo(a)");
        setUserRole(user.role);
      } catch (e) {
        console.error("Erro ao parsear dados do usuário:", e);
      }
    }
    setLoadingUser(false);
  }, []);

  // =========================================================================
  // 5.2 NAV BUTTONS
  // =========================================================================
  const navButtons: NavButton[] = [
    {
      title: "Gerenciar Alunos",
      path: "/secretario?tab=alunos",
      icon: GraduationCap,
      color: PRIMARY_HOGWARTS_RED,
      hover: "#A92A3A",
    },
    {
      title: "Gerenciar Professores",
      path: "/secretario?tab=professores",
      icon: Users,
      color: SLYTHERIN_GREEN,
      hover: "#106A3A",
    },
  ];

  // =========================================================================
  // 5.3 LOADING STATE
  // =========================================================================
  if (loadingUser) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: BG_DEEP_STONE,
        }}
      >
        <CircularProgress sx={{ color: SECONDARY_HOGWARTS_GOLD }} />
      </Box>
    );
  }

  // =========================================================================
  // 5.4 LOGOUT
  // =========================================================================
  const handleLogout = () => {
    localStorage.removeItem("@App:user");
    localStorage.removeItem("@App:token");
    navigate("/login");
  };

  // =========================================================================
  // 5.5 NON-SECRETARIO VIEW
  // =========================================================================
  if (userRole !== "SECRETARIO") {
    return (
      <Box
        sx={{
          m: 0,
          p: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: BG_DEEP_STONE,
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        <Box sx={{ color: TEXT_ACCENT_GOLD, mb: 2 }}>
          <Castle size={80} />
        </Box>

        <Typography
          variant="h4"
          color={TEXT_ACCENT_GOLD}
          textAlign="center"
          sx={{ textShadow: `1px 1px 3px ${PRIMARY_HOGWARTS_RED}` }}
        >
          Bem-vindo(a), {userName}!
        </Typography>
        <Typography variant="h6" color={TEXT_LIGHT_GRAY} mt={2}>
          Você está no Salão Comunal.
        </Typography>
        <Typography variant="body1" color={TEXT_LIGHT_GRAY} mt={1}>
          Aguarde a próxima missão ou clique no link de logout.
        </Typography>
        <MuiButton
          onClick={handleLogout}
          startIcon={<LogOut size={18} />}
          variant="text"
          sx={{
            mt: 4,
            color: TEXT_LIGHT_GRAY,
            opacity: 0.7,
            "&:hover": { color: PRIMARY_HOGWARTS_RED, opacity: 1 },
          }}
        >
          Sair do Mapa do Maroto
        </MuiButton>
      </Box>
    );
  }

  // =========================================================================
  // 5.6 SECRETARIO VIEW
  // =========================================================================
  return (
    <Box
      sx={{
        m: 0,
        p: 0,
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: BG_DEEP_STONE,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      <Paper
        elevation={15}
        sx={{
          padding: 4,
          maxWidth: 400,
          width: "90%",
          borderRadius: 3,
          backgroundColor: "rgba(18, 18, 18, 0.96)",
          backdropFilter: "blur(4px)",
          border: `2px solid ${SECONDARY_HOGWARTS_GOLD}`,
          boxShadow: `0px 0px 40px rgba(212, 175, 55, 0.4), inset 0px 0px 10px rgba(212, 175, 55, 0.1)`,
        }}
      >
        {/* Saudação */}
        <Box textAlign="center" mb={4}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
              "& svg": {
                color: SECONDARY_HOGWARTS_GOLD,
                width: 50,
                height: 50,
                filter: `drop-shadow(0 0 5px ${TEXT_ACCENT_GOLD}50)`,
              },
            }}
          >
            <Castle />
          </Box>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: "bold",
              color: TEXT_ACCENT_GOLD,
              textShadow: `1px 1px 3px ${PRIMARY_HOGWARTS_RED}`,
              mb: 1,
            }}
          >
            Painel Administrativo Mágico
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ color: TEXT_LIGHT_GRAY, fontStyle: "italic", opacity: 0.8 }}
          >
            Bem-vindo(a) de volta, Secretário(a) {userName}!
          </Typography>
        </Box>

        {/* Botões de Navegação */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: 4,
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {navButtons.map((button) => (
            <ManagementButton
              key={button.path}
              button={button}
              navigate={navigate}
            />
          ))}
        </Box>

        {/* Botão Logout */}
        <Box mt={4} textAlign="center">
          <MuiButton
            onClick={handleLogout}
            startIcon={<LogOut size={18} />}
            variant="text"
            sx={{
              color: TEXT_LIGHT_GRAY,
              opacity: 0.7,
              "&:hover": { color: PRIMARY_HOGWARTS_RED, opacity: 1 },
            }}
          >
            Sair do Mapa do Maroto
          </MuiButton>
        </Box>
      </Paper>
    </Box>
  );
}
