import React, { useState, useCallback, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Grid,
  Button,
  useTheme,
  createTheme,
  ThemeProvider,
} from "@mui/material";

import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RefreshIcon from "@mui/icons-material/Refresh";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import CastleIcon from "@mui/icons-material/Castle";

import { getDashboardStats as fetchDashboardStats } from "../services/SecretarioService";
import { useNavigate } from "react-router-dom";

// ====== TIPOS ======
export interface DashboardStats {
  totalAlunos: number;
  totalProfessores: number;
  turmasAtivas: number;
  casas: { nome: string; valor: number }[];
}

// ====== HOOKS MOCK ======
const useSnackbar = () => {
  const enqueueSnackbar = (
    message: string,
    options: { variant: "success" | "error" | "info" }
  ) => {
    console.log(`[NOTIFICAÇÃO ${options.variant.toUpperCase()}]: ${message}`);
  };
  return { enqueueSnackbar };
};

interface AuthContextProps {
  signOut: () => void;
  userId: string | null;
}

// Simulação do useAuth Real, assumindo que ele lida com a navegação.
// No seu projeto, você deve usar o hook real, por exemplo:
// const useAuth = () => useContext(AuthContext);
const useAuth = (): AuthContextProps => {
  const navigate = useNavigate(); // <-- Hook de navegação

  const signOut = () => {
    // 1. Limpa o token:
    // Ex: localStorage.removeItem('token');
    // Ex: document.cookie = 'auth=; Max-Age=0; path=/;';
    console.log("Logout REAL: Token removido e estado de autenticação limpo.");

    // 2. Redireciona para a tela de Login:
    navigate("/login");
  };

  // Assumindo que seu userId seria null após o logout, mas mantemos o mock para o dashboard:
  return { signOut, userId: "real-user-id" };
};

// ====== TEMA ======
const BG_PRINCIPAL = "#2B2A27";
const CARD_BG = "#212121";
const BASE_TEXT_COLOR = "#FFFFFF";
const ACCENT_DOURO = "#D3A625";

const customTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: ACCENT_DOURO },
    background: { default: BG_PRINCIPAL, paper: CARD_BG },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    h3: { fontWeight: 800 },
    h4: { fontWeight: 700 },
  },
  components: { MuiPaper: { defaultProps: { elevation: 12 } } },
});

// ====== BACKGROUND WRAPPER ======
const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Box
    sx={{
      minHeight: "100vh",
      backgroundImage: `url('/public/hogwarts.jpg')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      "& > *": { position: "relative", zIndex: 2 },
      "&:before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        zIndex: 1,
        boxShadow: "inset 0 0 25px rgba(0,0,0,0.5)",
      },
    }}
  >
    <Box sx={{ position: "relative", zIndex: 2 }}>{children}</Box>
  </Box>
);

// ====== MAPA DE CORES ======
const SECRETARIO_COLOR_MAP = {
  alunos: { primary: "#6A5ACD", secondary: ACCENT_DOURO },
  professores: { primary: "#C0C0C0", secondary: ACCENT_DOURO },
  turmas: { primary: "#FF4500", secondary: ACCENT_DOURO },
};

type MuiIconType = typeof GroupIcon;

// ====== COMPONENTE MUIStatCard ======
interface MUIStatCardProps {
  icon: MuiIconType;
  title: string;
  value: number;
  unit: string;
  colorKey: keyof typeof SECRETARIO_COLOR_MAP;
}

const MUIStatCard: React.FC<MUIStatCardProps> = ({
  icon: Icon,
  title,
  value,
  unit,
  colorKey,
}) => {
  const theme = useTheme();
  const primaryColor = SECRETARIO_COLOR_MAP[colorKey].primary;

  return (
    <Paper
      elevation={16}
      sx={{
        p: 4,
        borderRadius: "16px",
        bgcolor: CARD_BG,
        borderLeft: `8px solid ${primaryColor}`,
        boxShadow: theme.shadows[8],
        border: `1px solid ${ACCENT_DOURO}40`,
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: theme.shadows[16],
          cursor: "default",
        },
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box
          sx={{
            p: 1.5,
            borderRadius: "50%",
            bgcolor: primaryColor,
            color: CARD_BG,
            boxShadow: theme.shadows[4],
          }}
        >
          <Icon fontSize="large" />
        </Box>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          textTransform="uppercase"
          sx={{ color: ACCENT_DOURO, opacity: 0.8 }}
        >
          {title}
        </Typography>
      </Box>
      <Box mt={3}>
        <Typography
          variant="h3"
          fontWeight={800}
          sx={{ color: BASE_TEXT_COLOR }}
        >
          {value.toLocaleString("pt-BR")}
        </Typography>
        <Typography variant="body2" sx={{ color: primaryColor, opacity: 0.8 }}>
          {unit}
        </Typography>
      </Box>
    </Paper>
  );
};

// ====== COMPONENTE MUIActionCard ======
interface MUIActionCardProps {
  icon: MuiIconType;
  title: string;
  description: string;
  linkTo: string;
  colorKey: keyof typeof SECRETARIO_COLOR_MAP;
}

const MUIActionCard: React.FC<MUIActionCardProps> = ({
  icon: Icon,
  title,
  description,
  linkTo,
  colorKey,
}) => {
  const theme = useTheme();
  const { primary: primaryColor, secondary: secondaryColor } =
    SECRETARIO_COLOR_MAP[colorKey];

  return (
    <Paper
      component="a"
      href={linkTo}
      elevation={16}
      sx={{
        p: 4,
        borderRadius: "16px",
        bgcolor: CARD_BG,
        borderTop: `4px solid ${primaryColor}`,
        boxShadow: theme.shadows[8],
        border: `1px solid ${ACCENT_DOURO}40`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "transform 0.3s, box-shadow 0.3s, background-color 0.3s",
        textDecoration: "none",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: theme.shadows[16],
          cursor: "pointer",
          backgroundColor: CARD_BG + "E0",
        },
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <Box
          sx={{
            p: 2,
            borderRadius: "8px",
            bgcolor: primaryColor,
            color: CARD_BG,
            boxShadow: theme.shadows[2],
            mr: 2,
          }}
        >
          <Icon fontSize="large" />
        </Box>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: secondaryColor }}
        >
          {title}
        </Typography>
      </Box>
      <Typography variant="body1" sx={{ color: BASE_TEXT_COLOR, flexGrow: 1 }}>
        {description}
      </Typography>
      <Box
        mt={3}
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        sx={{ color: primaryColor, fontWeight: 700 }}
      >
        <Typography variant="subtitle2" sx={{ mr: 1, fontWeight: 700 }}>
          Acessar Gestão
        </Typography>
        <ArrowForwardIcon fontSize="small" />
      </Box>
    </Paper>
  );
};

// ====== DASHBOARD PRINCIPAL ======
export const SecretarioDashboard: React.FC = () => {
  const { signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAlunos: 0,
    totalProfessores: 0,
    turmasAtivas: 0,
    casas: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardStats();
      setStats({
        totalAlunos: data.totalAlunos,
        totalProfessores: data.totalProfessores,
        turmasAtivas: data.turmasAtivas,
        casas: data.casas.map((c) => ({ nome: c.nome, valor: c.alunos })),
      });
      enqueueSnackbar("Estatísticas carregadas com sucesso!", {
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      enqueueSnackbar("Erro ao carregar estatísticas.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    // Chamamos a função de carregamento
    loadStats();

    // O array vazio garante que isso rode APENAS uma vez (na montagem)
  }, []);

  const handleLogout = (): void => signOut();

  return (
    <BackgroundWrapper>
      <Container maxWidth="lg" sx={{ py: 10, position: "relative" }}>
        <Button
          onClick={handleLogout}
          variant="contained"
          startIcon={<MeetingRoomIcon />}
          sx={{
            position: "absolute",
            top: theme.spacing(3),
            right: theme.spacing(3),
            zIndex: 10,
            backgroundColor: ACCENT_DOURO,
            color: CARD_BG,
            fontWeight: 700,
            "&:hover": {
              backgroundColor: SECRETARIO_COLOR_MAP.professores.primary,
              color: BASE_TEXT_COLOR,
            },
          }}
        >
          Sair da Sala Comunal
        </Button>

        <Typography
          variant="h3"
          component="h1"
          sx={{
            color: ACCENT_DOURO,
            borderBottom: `5px solid ${SECRETARIO_COLOR_MAP.professores.primary}`,
            mb: 4,
            textAlign: "center",
            mt: 6,
          }}
        >
          <CastleIcon sx={{ fontSize: "inherit", mr: 2 }} />
          Painel de Gestão da Escola
        </Typography>

        <Box display="flex" justifyContent="center" mb={4}>
          <Button
            onClick={loadStats}
            disabled={loading}
            variant="contained"
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <RefreshIcon />
              )
            }
            sx={{
              backgroundColor: ACCENT_DOURO,
              color: CARD_BG,
              fontWeight: 700,
              "&:hover": { backgroundColor: ACCENT_DOURO, opacity: 0.9 },
            }}
          >
            {loading ? "Atualizando..." : "Atualizar Dados"}
          </Button>
        </Box>

        <Grid container spacing={4} justifyContent="center" mb={8}>
          <Grid item xs={12} md={3}>
            <MUIStatCard
              icon={GroupIcon}
              title="Total de Alunos"
              value={stats.totalAlunos}
              unit="Estudantes Registrados"
              colorKey="alunos"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <MUIStatCard
              icon={SchoolIcon}
              title="Total de Professores"
              value={stats.totalProfessores}
              unit="Docentes Ativos"
              colorKey="professores"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <MUIStatCard
              icon={CalendarMonthIcon}
              title="Turmas Ativas"
              value={stats.turmasAtivas}
              unit="Turmas em Curso"
              colorKey="turmas"
            />
          </Grid>
        </Grid>

        <Typography
          variant="h4"
          sx={{
            color: BASE_TEXT_COLOR,
            fontWeight: 700,
            mb: 4,
            borderTop: `1px solid ${ACCENT_DOURO}40`,
            pt: 4,
          }}
        >
          Ações de Gerenciamento
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <MUIActionCard
              icon={GroupIcon}
              title="Gerenciar Estudantes"
              description="Acesse esta área para registrar, editar e remover alunos. Mantenha os dados de matrícula em ordem."
              linkTo="/secretario/alunos"
              colorKey="alunos"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MUIActionCard
              icon={SchoolIcon}
              title="Gerenciar Docentes"
              description="Mantenha o quadro de funcionários atualizado, registrando e editando perfis de professores."
              linkTo="/secretario/professores"
              colorKey="professores"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MUIActionCard
              icon={CalendarMonthIcon}
              title="Gestão de Turmas"
              description="Crie, edite e organize as turmas e suas disciplinas para o ano letivo."
              linkTo="/secretario/turmas"
              colorKey="turmas"
            />
          </Grid>
        </Grid>
      </Container>
    </BackgroundWrapper>
  );
};

// ====== WRAPPER DE TEMA ======
const App = () => (
  <ThemeProvider theme={customTheme}>
    <SecretarioDashboard />
  </ThemeProvider>
);

export default App;
