// src/pages/ProfessorPage.tsx

import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Button,
  useTheme,
} from "@mui/material";

import SchoolIcon from "@mui/icons-material/School";
import ClassIcon from "@mui/icons-material/Class";
import BookIcon from "@mui/icons-material/Book";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";

import { useAuth } from "../hooks/LoginHooks";
import { getMeDetails } from "../services/ProfessorService";
import type { ProfessorDetalhe } from "../types/Professor";

// =========================================================================
// 1. Constantes de estilo
// =========================================================================
const BG_PRINCIPAL = "#2B2A27";
const CARD_BG = "#212121";
const BASE_TEXT_COLOR = "#FFFFFF";
const ACCENT_DOURO = "#D3A625";
const ACCENT_DOURO_SUAVE = "#EDE6D6";

// =========================================================================
// 2. BackgroundWrapper
// =========================================================================
const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      minHeight: "100vh",
      backgroundImage: `url('/sala_aula.jpg')`,
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
        backgroundColor: "rgba(0,0,0,0.7)",
        zIndex: 1,
        boxShadow: "inset 0 0 25px rgba(0,0,0,0.5)",
      },
    }}
  >
    <Box sx={{ position: "relative", zIndex: 2 }}>{children}</Box>
  </Box>
);

// =========================================================================
// 3. DetailItem
// =========================================================================
interface DetailItemProps {
  label: string;
  value?: string;
  icon?: React.ComponentType<any>;
  primaryColor: string;
  textColor?: string;
}

const DetailItem = ({
  label,
  value = "",
  icon: Icon,
  primaryColor,
  textColor = BASE_TEXT_COLOR,
}: DetailItemProps) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      borderBottom: `1px solid ${primaryColor}50`,
      py: 1,
    }}
  >
    <Typography
      variant="subtitle1"
      sx={{
        color: primaryColor,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
      }}
    >
      {Icon && (
        <Icon sx={{ mr: 1, width: 16, height: 16, color: primaryColor }} />
      )}
      {label}:
    </Typography>
    <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: 700 }}>
      {value}
    </Typography>
  </Box>
);

// =========================================================================
// 4. ProfessorPage
// =========================================================================
export const ProfessorPage = () => {
  const { user, loading: loadingAuth, signOut } = useAuth();
  const [professorDetalhe, setProfessorDetalhe] =
    useState<ProfessorDetalhe | null>(null);

  const [loadingData, setLoadingData] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.backgroundColor = BG_PRINCIPAL;
    }
  }, []);

  // =========================================================================
  // 5. Carregar dados do professor logado
  // =========================================================================
  useEffect(() => {
    if (loadingAuth || !user?.email) return;

    const loadData = async () => {
      setLoadingData(true);
      try {
        const data = await getMeDetails();
        setProfessorDetalhe(data);
      } catch (err) {
        console.error("Erro ao carregar dados do professor:", err);
        setProfessorDetalhe(null);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [loadingAuth, user?.email]);

  const handleLogout = () => signOut();

  if (loadingAuth || loadingData) {
    return (
      <BackgroundWrapper>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress sx={{ color: ACCENT_DOURO }} />
        </Box>
      </BackgroundWrapper>
    );
  }

  // =========================================================================
  // 6. Render
  // =========================================================================
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
            backgroundColor: ACCENT_DOURO,
            color: CARD_BG,
            fontWeight: 700,
            "&:hover": { backgroundColor: "#9a7c1c", color: BASE_TEXT_COLOR },
          }}
        >
          Sair do Salão Comunal
        </Button>

        <Typography
          variant="h3"
          sx={{
            color: ACCENT_DOURO,
            borderBottom: `5px solid ${ACCENT_DOURO}`,
            mb: 4,
            textAlign: "center",
          }}
        >
          Seja Bem-vindo(a), {professorDetalhe?.nome ?? user?.nome ?? ""}
        </Typography>

        <Grid container spacing={4}>
          {/* =========================  CARD ESQUERDO  ====================== */}
          <Grid item xs={12} md={5}>
            <Paper
              sx={{
                p: 4,
                borderRadius: "16px",
                bgcolor: CARD_BG,
                borderLeft: `8px solid ${ACCENT_DOURO}`,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: ACCENT_DOURO,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <SchoolIcon sx={{ mr: 2, color: ACCENT_DOURO_SUAVE }} />
                Dados do Professor
              </Typography>

              <Box>
                <DetailItem
                  label="Matrícula"
                  value={professorDetalhe?.matricula ?? ""}
                  icon={ClassIcon}
                  primaryColor={ACCENT_DOURO_SUAVE}
                />

                <DetailItem
                  label="Departamento"
                  value={professorDetalhe?.departamento ?? ""}
                  icon={ClassIcon}
                  primaryColor={ACCENT_DOURO_SUAVE}
                />

                <DetailItem
                  label="Email"
                  value={professorDetalhe?.email ?? ""}
                  icon={ClassIcon}
                  primaryColor={ACCENT_DOURO_SUAVE}
                />

                <DetailItem
                  label="CPF"
                  value={professorDetalhe?.cpf ?? ""}
                  icon={ClassIcon}
                  primaryColor={ACCENT_DOURO_SUAVE}
                />

                <DetailItem
                  label="Telefone"
                  value={professorDetalhe?.telefone ?? ""}
                  icon={ClassIcon}
                  primaryColor={ACCENT_DOURO_SUAVE}
                />
              </Box>
            </Paper>
          </Grid>

          {/* =========================  CARD DIREITO ======================== */}
          <Grid item xs={12} md={7}>
            <Paper
              sx={{
                p: 4,
                borderRadius: "16px",
                bgcolor: CARD_BG,
                borderLeft: `8px solid ${ACCENT_DOURO_SUAVE}`,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: ACCENT_DOURO,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <BookIcon sx={{ mr: 2, color: ACCENT_DOURO }} /> Disciplinas
                Ministradas (
                {professorDetalhe?.disciplinasMinistradas?.length ?? 0})
              </Typography>

              <List
                sx={{
                  border: `1px solid ${ACCENT_DOURO}50`,
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                {(professorDetalhe?.disciplinasMinistradas ?? []).map(
                  (d, i) => (
                    <ListItem
                      key={d.id}
                      sx={{
                        bgcolor: i % 2 === 0 ? CARD_BG : BG_PRINCIPAL + "50",
                        borderBottom: `1px solid ${ACCENT_DOURO_SUAVE}40`,
                        "&:last-child": { borderBottom: "none" },
                        py: 1.5,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <BookIcon sx={{ color: ACCENT_DOURO }} />
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <span
                            style={{ fontWeight: 700, color: BASE_TEXT_COLOR }}
                          >
                            {d.nome}
                          </span>
                        }
                        secondary={
                          <span style={{ color: ACCENT_DOURO_SUAVE }}>
                            Turmas: {d.turmas.map((t) => t.nome).join(", ")} |
                            Turnos: {d.turmas.map((t) => t.turno).join(", ")}
                          </span>
                        }
                      />
                    </ListItem>
                  )
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </BackgroundWrapper>
  );
};
