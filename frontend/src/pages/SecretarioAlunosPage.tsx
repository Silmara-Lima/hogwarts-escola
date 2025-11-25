// =========================================================================
// 1. IMPORTS
// =========================================================================
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";

import { AlunosTable } from "../components/aluno/ConsultarAlunoTable";
import { CriarAlunoModal } from "../components/aluno/CriarAlunoModal";
import { EditarAlunoModal } from "../components/aluno/EditarAlunoModal";

import {
  getAlunos,
  deleteAluno,
  createAluno,
  updateAluno,
} from "../services/AlunosService";
import type { AlunoFrontEnd, CreateAlunoData } from "../types/Alunos";
import { useDebounce } from "../hooks/useDebounce";

// =========================================================================
// 2. COMPONENTE PRINCIPAL
// =========================================================================
export const SecretarioAlunosPage = () => {
  const navigate = useNavigate();

  // =========================================================================
  // 2.1 STATE
  // =========================================================================
  const [alunos, setAlunos] = useState<AlunoFrontEnd[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [alunoEditando, setAlunoEditando] = useState<AlunoFrontEnd | null>(
    null
  );

  const debouncedTerm = useDebounce(searchTerm, 300);

  // =========================================================================
  // 2.2 FUNÇÕES AUXILIARES
  // =========================================================================
  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const mapAlunoFromBackend = (a: any): AlunoFrontEnd => {
    const matriculaFinal =
      a.matricula ??
      a.matriculas?.[0]?.codigo ??
      a.matriculas?.[0]?.numero ??
      "";
    const dataNascFinal = a.dataNascimento ? formatDate(a.dataNascimento) : "";
    const casaObj = a.casa
      ? { id: Number(a.casa.id), nome: a.casa.nome ?? "—" }
      : null;
    const turmaObj = a.turma
      ? {
          id: Number(a.turma.id),
          serie: a.turma.serie ?? "",
          turno: a.turma.turno ?? "",
          ano: a.turma.ano ?? "",
        }
      : null;

    return {
      id: Number(a.id),
      nome: a.nome,
      email: a.email,
      matricula: matriculaFinal,
      cpf: a.cpf ?? "",
      telefone: a.telefone ?? "",
      dataNascimento: dataNascFinal,
      casa: casaObj,
      turma: turmaObj,
      casaId: casaObj?.id ?? "",
      turmaId: turmaObj?.id ?? "",
      turno: a.turno ?? turmaObj?.turno ?? "",
    };
  };

  // =========================================================================
  // 2.3 CARREGAR ALUNOS
  // =========================================================================
  const carregarAlunos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAlunos();
      setAlunos(data.map(mapAlunoFromBackend));
    } catch {
      setSnackbar({
        open: true,
        message: "Erro ao buscar alunos.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarAlunos();
  }, [carregarAlunos]);

  // =========================================================================
  // 2.4 DELETE
  // =========================================================================
  const handleDeleteConfirm = (id: number) => setConfirmDeleteId(id);

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    const idToDelete = confirmDeleteId;

    try {
      await deleteAluno(idToDelete);
      setAlunos((prev) => prev.filter((a) => a.id !== idToDelete));
      setSnackbar({
        open: true,
        message: "Aluno removido com sucesso!",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Erro ao deletar aluno.",
        severity: "error",
      });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // =========================================================================
  // 2.5 EDITAR
  // =========================================================================
  const handleOpenEdit = (aluno: AlunoFrontEnd) =>
    setAlunoEditando({ ...aluno });
  const handleCloseEdit = () => setAlunoEditando(null);

  const handleSaveEdit = async (formData: AlunoFrontEnd) => {
    try {
      const atualizadoDoServidor = await updateAluno(formData.id, {
        nome: formData.nome,
        email: formData.email,
        matricula: formData.matricula,
        dataNascimento: formData.dataNascimento,
        cpf: formData.cpf || null,
        telefone: formData.telefone || null,
        casaId: formData.casaId ? Number(formData.casaId) : null,
        turmaId: formData.turmaId ? Number(formData.turmaId) : null,
        turno: formData.turno || undefined,
      });

      const alunoMapeado = mapAlunoFromBackend(atualizadoDoServidor);
      setAlunos((prev) =>
        prev.map((a) => (a.id === alunoMapeado.id ? alunoMapeado : a))
      );

      setSnackbar({
        open: true,
        message: "Aluno atualizado com sucesso!",
        severity: "success",
      });
      handleCloseEdit();
    } catch {
      setSnackbar({
        open: true,
        message: "Erro ao atualizar aluno.",
        severity: "error",
      });
    }
  };

  // =========================================================================
  // 2.6 CRIAR
  // =========================================================================
  const handleCreateSave = async (dados: CreateAlunoData) => {
    try {
      await createAluno(dados);
      setOpenCreateModal(false);
      await carregarAlunos();
      setSnackbar({
        open: true,
        message: "Aluno criado com sucesso!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erro ao criar aluno.",
        severity: "error",
      });
    }
  };

  // =========================================================================
  // 2.7 FILTRO
  // =========================================================================
  const alunosFiltrados = useMemo(() => {
    if (!debouncedTerm.trim()) return alunos;
    const term = debouncedTerm.toLowerCase().trim();
    return alunos.filter((a) =>
      [a.nome, a.matricula, a.email, a.cpf, a.casa?.nome].some((v) =>
        (v ?? "").toLowerCase().includes(term)
      )
    );
  }, [alunos, debouncedTerm]);

  // =========================================================================
  // 2.8 MODAL HANDLERS
  // =========================================================================
  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    document.activeElement instanceof HTMLElement &&
      document.activeElement.blur();
  };

  // =========================================================================
  // 2.9 RENDER
  // =========================================================================
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
      p={3}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 1200,
          p: 3,
          position: "relative",
          borderRadius: 2,
        }}
      >
        {/* Voltar */}
        <IconButton
          aria-label="voltar"
          onClick={() => navigate("/secretario/dashboard")}
          size="small"
          sx={{ position: "absolute", left: 16, top: 16 }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>

        {/* Título */}
        <Typography variant="h5" align="center" fontWeight={600} mb={3}>
          Lista de Alunos
        </Typography>

        {/* Search */}
        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="Buscar aluno por nome, matrícula, email ou casa..."
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
                label={alunosFiltrados.length}
                size="small"
                color="primary"
                variant="outlined"
              />
              {alunosFiltrados.length !== alunos.length && (
                <Typography variant="body2" color="text.secondary">
                  de {alunos.length} total
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Tabela de Alunos */}
        <AlunosTable
          alunos={alunosFiltrados}
          deletingId={deletingId}
          onDelete={handleDeleteConfirm}
          onEdit={handleOpenEdit}
          loading={loading}
          searchQuery={debouncedTerm}
        />

        {/* Botão Novo Aluno */}
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button variant="contained" onClick={() => setOpenCreateModal(true)}>
            Novo Aluno
          </Button>
        </Box>

        {/* Snackbar */}
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

      {/* Modais */}
      <EditarAlunoModal
        open={alunoEditando !== null}
        aluno={alunoEditando}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
      />
      <CriarAlunoModal
        open={openCreateModal}
        onClose={handleCloseCreateModal}
        onSave={handleCreateSave}
      />

      {/* Dialog de exclusão */}
      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>Deseja realmente excluir este aluno?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={deletingId !== null}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecretarioAlunosPage;
