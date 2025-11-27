// src/pages/SecretarioProfessoresPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  CircularProgress,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import { CriarProfessorModal } from "../components/professor/CriarProfessorModal";
import { EditarProfessorModal } from "../components/professor/EditarProfessorModal";

import {
  getProfessores,
  deleteProfessor,
  getProfessorDetails,
  createProfessor,
  updateProfessor,
  vincularDisciplinas,
} from "../services/ProfessorService";

import type {
  ProfessorDetalhe,
  ProfessorCreateData,
  ProfessorUpdateData,
  DisciplinaTurmaVinculo,
} from "../types/Professor";

import { useDebounce } from "../hooks/useDebounce";

type CreateProfessorData = ProfessorCreateData;
type UpdateProfessorData = ProfessorUpdateData;

export const SecretarioProfessoresPage: React.FC = () => {
  const navigate = useNavigate();

  const [professores, setProfessores] = useState<ProfessorDetalhe[]>([]);
  const [loading, setLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedTerm = useDebounce(searchTerm, 300);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [professorEditando, setProfessorEditando] =
    useState<ProfessorDetalhe | null>(null);

  // ----------------------- CARREGAR PROFESSORES -----------------------
  const carregarProfessores = useCallback(async () => {
    setLoading(true);
    try {
      const listaPublica = await getProfessores();

      const listaCompletaPromises = listaPublica.map(async (p) => {
        try {
          const details = await getProfessorDetails(p.id);
          return details;
        } catch (e) {
          console.error(`Erro buscando detalhes do professor ${p.id}`, e);
          return null;
        }
      });

      const listaCompleta = await Promise.all(listaCompletaPromises);

      setProfessores(
        listaCompleta.filter((p) => p !== null) as ProfessorDetalhe[]
      );
    } catch (err) {
      console.error("Erro ao carregar professores:", err);
      setSnackbar({
        open: true,
        message: "Erro ao carregar professores.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarProfessores();
  }, [carregarProfessores]);

  // ----------------------- DELETE -----------------------
  const handleDeleteConfirm = (id: number) => setConfirmDeleteId(id);

  const handleDelete = async () => {
    if (confirmDeleteId == null) return;

    setDeletingId(confirmDeleteId);

    try {
      await deleteProfessor(confirmDeleteId);

      setProfessores((prev) => prev.filter((p) => p.id !== confirmDeleteId));

      setSnackbar({
        open: true,
        message: "Professor removido com sucesso!",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Erro ao deletar professor:", error);

      const msg =
        error?.response?.data?.message || "Erro ao deletar professor.";

      setSnackbar({
        open: true,
        message: msg,
        severity: "error",
      });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // ----------------------- EDITAR -----------------------
  const handleOpenEdit = (prof: ProfessorDetalhe) =>
    setProfessorEditando({ ...prof });

  const handleCloseEdit = () => setProfessorEditando(null);

  const handleSaveEdit = async (
    professorId: number,
    dataToUpdate: UpdateProfessorData
  ) => {
    try {
      if (Object.keys(dataToUpdate).length > 0) {
        await updateProfessor(professorId, dataToUpdate);

        setSnackbar({
          open: true,
          message: "Dados básicos atualizados!",
          severity: "success",
        });

        try {
          const updated = await getProfessorDetails(professorId);
          setProfessores((prev) =>
            prev.map((p) => (p.id === professorId ? updated : p))
          );
        } catch {
          await carregarProfessores();
        }
      }
    } catch (e: any) {
      console.error("Erro ao salvar dados básicos:", e);
      throw new Error(
        e?.response?.data?.message ||
          "Erro ao salvar alteração dos dados básicos."
      );
    }
  };

  const handleUpdateDisciplinas = async (
    professorId: number,
    vinculos: DisciplinaTurmaVinculo[]
  ) => {
    try {
      await vincularDisciplinas(professorId, vinculos);

      const updated = await getProfessorDetails(professorId);
      setProfessores((prev) =>
        prev.map((p) => (p.id === professorId ? updated : p))
      );

      setSnackbar({
        open: true,
        message: "Disciplinas e Turma atualizadas!",
        severity: "success",
      });
    } catch (e: any) {
      console.error("Erro ao atualizar disciplinas:", e);
      throw new Error(
        e?.response?.data?.message || "Erro ao atualizar disciplinas/turma."
      );
    }
  };

  // ----------------------- CREATE -----------------------
  const handleCreateSave = async (dados: CreateProfessorData) => {
    try {
      await createProfessor(dados);
      setOpenCreateModal(false);
      await carregarProfessores();

      setSnackbar({
        open: true,
        message: "Professor criado com sucesso!",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Erro ao criar professor:", error);

      let errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Erro ao criar professor";

      if (error?.code === "P2002" || error?.response?.data?.code === "P2002") {
        const target =
          error?.meta?.target || error?.response?.data?.meta?.target;
        errorMessage = `Já existe um professor com este ${
          target || "campo único"
        }.`;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });

      throw new Error(errorMessage);
    }
  };

  // ----------------------- FILTRO (SEARCH) -----------------------
  const professoresFiltrados = useMemo(() => {
    if (!debouncedTerm.trim()) return professores;
    const term = debouncedTerm.toLowerCase();

    return professores.filter((p) =>
      [
        p.nome,
        p.matricula,
        p.email,
        p.departamento || "",
        p.disciplinasMinistradas?.map((d) => d.nome).join(", ") || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [professores, debouncedTerm]);

  // ----------------------- RENDER -----------------------
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      minHeight="100vh"
      p={3}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 1200,
          p: 3,
          borderRadius: 2,
          position: "relative",
          bgcolor: "background.paper",
        }}
      >
        <IconButton
          aria-label="voltar"
          onClick={() => navigate("/secretario/dashboard")}
          size="small"
          sx={{ position: "absolute", left: 16, top: 16 }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>

        <Typography variant="h5" align="center" fontWeight={600} mb={3}>
          Quadro de Professores 🧑‍🏫
        </Typography>

        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="Buscar professor por nome, matrícula, departamento ou disciplina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {debouncedTerm && (
            <Box mt={1} display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="text.secondary">
                Resultados:
              </Typography>
              <Chip
                label={professoresFiltrados.length}
                size="small"
                color="primary"
              />
            </Box>
          )}
        </Box>

        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.main" }}>
                <TableCell
                  sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                >
                  Nome
                </TableCell>
                <TableCell
                  sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                >
                  Matrícula
                </TableCell>
                <TableCell
                  sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                >
                  Email
                </TableCell>
                <TableCell
                  sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                >
                  Departamento
                </TableCell>
                <TableCell
                  sx={{ color: "primary.contrastText", fontWeight: "bold" }}
                >
                  Disciplinas
                </TableCell>
                <TableCell
                  sx={{
                    color: "primary.contrastText",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : professoresFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    Nenhum professor encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                professoresFiltrados.map((prof) => (
                  <TableRow key={prof.id} hover>
                    <TableCell>{prof.nome}</TableCell>
                    <TableCell>{prof.matricula}</TableCell>
                    <TableCell>{prof.email}</TableCell>
                    <TableCell>{prof.departamento || "-"}</TableCell>

                    <TableCell>
                      {prof.disciplinasMinistradas &&
                      prof.disciplinasMinistradas.length > 0
                        ? prof.disciplinasMinistradas
                            ?.map((d: { nome: string }) => d.nome)
                            .join(", ")
                        : "Nenhuma"}
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenEdit(prof)}
                        aria-label={`editar-${prof.id}`}
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() => handleDeleteConfirm(prof.id)}
                        aria-label={`excluir-${prof.id}`}
                      >
                        <DeleteForeverIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button variant="contained" onClick={() => setOpenCreateModal(true)}>
            Novo Professor
          </Button>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>

      {/* MODAIS */}
      <CriarProfessorModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSave={handleCreateSave}
        onSuccess={carregarProfessores}
      />

      <EditarProfessorModal
        open={!!professorEditando}
        professor={professorEditando}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
        onUpdateDisciplinas={handleUpdateDisciplinas}
      />

      {/* CONFIRM DELETE */}
      <Dialog
        open={confirmDeleteId != null}
        onClose={() => setConfirmDeleteId(null)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>

        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o professor{" "}
            <Typography component="span" fontWeight="bold">
              {professores.find((p) => p.id === confirmDeleteId)?.nome ||
                "selecionado"}
            </Typography>
            ?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setConfirmDeleteId(null)}
            disabled={!!deletingId}
          >
            Cancelar
          </Button>

          <Button onClick={handleDelete} color="error" disabled={!!deletingId}>
            {deletingId ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecretarioProfessoresPage;
