// =========================================================================
// 1. AlunoPage Component
// =========================================================================

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
  useTheme,
  Button,
} from "@mui/material";
import ClassIcon from "@mui/icons-material/Class";
import ScheduleIcon from "@mui/icons-material/Schedule";
import BookIcon from "@mui/icons-material/Book";
import * as React from "react";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";

import { useAuth } from "../hooks/LoginHooks";
import { getAlunoDetalheMe } from "../services/AlunosService";
import { getTemaCasa, type TemaCasa } from "../types/CasaTemas";
import type { AlunoDetalhe } from "../types/Alunos";

// =========================================================================
// 2. Constantes de Estilo
// =========================================================================
const BG_PRINCIPAL = "#2B2A27";
const CARD_BG = "#212121";
const BASE_TEXT_COLOR = "#FFFFFF";
const ACCENT_DOURO = "#D3A625";
const ACCENT_DOURO_SUAVE = "#EDE6D6";

// =========================================================================
// 3. BackgroundWrapper
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
// 4. DetailItem Component
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
    className="flex justify-between border-b py-1"
    sx={{ borderColor: primaryColor + "50" }}
  >
    <Typography
      variant="subtitle1"
      className="font-medium flex items-center"
      sx={{ color: primaryColor, fontWeight: 600 }}
    >
      {Icon && (
        <Icon sx={{ width: 16, height: 16, mr: 1, color: primaryColor }} />
      )}{" "}
      {label}:
    </Typography>
    <Typography
      variant="subtitle1"
      className="font-semibold"
      sx={{ color: textColor, fontWeight: 700 }}
    >
      {value}
    </Typography>
  </Box>
);

// =========================================================================
// 5. AlunoPage Component
// =========================================================================
export const AlunoPage = () => {
  const { user, loading: loadingAuth, signOut } = useAuth();
  const [alunoDetalhe, setAlunoDetalhe] = useState<AlunoDetalhe | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [temaCasa, setTemaCasa] = useState<TemaCasa>(getTemaCasa("Default"));
  const theme = useTheme();

  // --- Ajuste de background do body ---
  useEffect(() => {
    if (typeof document !== "undefined")
      document.body.style.backgroundColor = BG_PRINCIPAL;
  }, []);

  // =========================================================================
  // 6. Carregamento de dados do aluno
  // =========================================================================
  useEffect(() => {
    if (loadingAuth || !user) return;

    const loadData = async () => {
      setLoadingData(true);
      try {
        const dataFinal: AlunoDetalhe = await getAlunoDetalheMe();
        setAlunoDetalhe(dataFinal || null);
      } catch (err) {
        console.error("Erro ao carregar dados do aluno:", err);
        setAlunoDetalhe(null);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();

    // --- DEFINIR TEMA PELO LOGIN ---
    const nomeCasa = user?.nomeCasa || inferirCasaPeloNome(user?.nome || "");
    setTemaCasa(getTemaCasa(nomeCasa));
  }, [loadingAuth, user]);

  // --- Função de fallback para determinar a casa pelo nome ---
  const inferirCasaPeloNome = (nome: string): string => {
    const map: Record<string, string> = {
      "Harry Potter": "Grifinória",
      "Hermione Granger": "Grifinória",
      "Ron Weasley": "Grifinória",
      "Draco Malfoy": "Sonserina",
      "Luna Lovegood": "Corvinal",
      "Cedric Diggory": "Lufa-Lufa",
    };
    return map[nome] || "Default";
  };

  const PRIMARY_COLOR_HEX = temaCasa.primary;
  const ACCENT_COLOR_HEX = temaCasa.secondary;
  const CasaIcon = temaCasa.icon;

  const handleLogout = () => signOut();

  // =========================================================================
  // 7. Loading
  // =========================================================================
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
  // 8. Renderização Principal
  // =========================================================================
  return (
    <BackgroundWrapper>
      <Container maxWidth="lg" sx={{ py: 10, position: "relative" }}>
        {/* Botão de logout */}
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
            "&:hover": {
              backgroundColor: PRIMARY_COLOR_HEX,
              color: BASE_TEXT_COLOR,
            },
          }}
        >
          Sair do Salão Comunal
        </Button>

        <Typography
          variant="h3"
          component="h1"
          sx={{
            color: ACCENT_DOURO,
            borderBottom: `5px solid ${PRIMARY_COLOR_HEX}`,
            mb: 4,
            textAlign: "center",
          }}
        >
          Seja Bem-vindo(a), {alunoDetalhe?.nome || user?.nome || ""}{" "}
          {temaCasa.emoji}
        </Typography>

        <Grid container spacing={4}>
          {/* Card de detalhes do aluno */}
          <Grid item xs={12} md={5}>
            <Paper
              sx={{
                p: 4,
                borderRadius: "16px",
                bgcolor: CARD_BG,
                borderLeft: `8px solid ${PRIMARY_COLOR_HEX}`,
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
                <CasaIcon sx={{ mr: 2, color: ACCENT_COLOR_HEX }} /> Dados
                Mágicos
              </Typography>
              <Box>
                <DetailItem
                  label="Matrícula"
                  value={alunoDetalhe?.matricula || ""}
                  icon={ClassIcon}
                  primaryColor={ACCENT_COLOR_HEX}
                />
                <DetailItem
                  label="Disciplina Principal"
                  value={alunoDetalhe?.curso || ""}
                  icon={ClassIcon}
                  primaryColor={ACCENT_COLOR_HEX}
                />
                <DetailItem
                  label="Coruja Eletrônica"
                  value={alunoDetalhe?.email || ""}
                  icon={ClassIcon}
                  primaryColor={ACCENT_COLOR_HEX}
                />
                <DetailItem
                  label="Casa Comunal"
                  value={
                    alunoDetalhe?.nomeCasa || temaCasa ? temaCasa.emoji : ""
                  }
                  icon={CasaIcon}
                  primaryColor={ACCENT_COLOR_HEX}
                />
                <DetailItem
                  label="Período de Aulas"
                  value={alunoDetalhe?.turno || ""}
                  icon={ScheduleIcon}
                  primaryColor={ACCENT_COLOR_HEX}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Card de disciplinas */}
          <Grid item xs={12} md={7}>
            <Paper
              sx={{
                p: 4,
                borderRadius: "16px",
                bgcolor: CARD_BG,
                borderLeft: `8px solid ${ACCENT_COLOR_HEX}`,
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
                <BookIcon sx={{ mr: 2, color: PRIMARY_COLOR_HEX }} /> Grade de
                Feitiços e Encantamentos (
                {alunoDetalhe?.disciplinas?.length || 0})
              </Typography>
              <List
                sx={{
                  border: `1px solid ${PRIMARY_COLOR_HEX}50`,
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                {(alunoDetalhe?.disciplinas || []).map((d, i) => (
                  <ListItem
                    key={d.id}
                    sx={{
                      bgcolor: i % 2 === 0 ? CARD_BG : BG_PRINCIPAL + "50",
                      borderBottom: `1px solid ${ACCENT_COLOR_HEX}40`,
                      "&:last-child": { borderBottom: "none" },
                      py: 1.5,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <BookIcon sx={{ color: PRIMARY_COLOR_HEX }} />
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
                          Mestre(a): {d.professor} | Horário de Poções:{" "}
                        </span>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </BackgroundWrapper>
  );
};
