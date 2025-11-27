// =========================================================================
// 1. IMPORTS
// =========================================================================
import { useEffect, useState, useCallback, useMemo } from "react";
// 🟢 FUNÇÃO DE UTILIDADE IMPORTADA
import { formatarDataISOParaBR } from "../utils/DataUtils";
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
import type { AlunoPropType } from "../components/aluno/EditarAlunoModal";

import {
  getAlunos,
  deleteAluno,
  createAluno,
  updateAluno,
} from "../services/AlunosService";

import type {
  AlunoFrontEnd,
  CreateAlunoData,
  UpdateAlunoData,
} from "../types/Alunos";
import type { Turma } from "../types/CasaeTurma";
import { useDebounce } from "../hooks/useDebounce";

// =========================================================================
// 2. COMPONENTE PRINCIPAL
// =========================================================================
export const SecretarioAlunosPage = () => {
  const navigate = useNavigate();

  const mapAlunoFrontToPropType = (a: AlunoFrontEnd): AlunoPropType => ({
    id: a.id,
    nome: a.nome,
    matricula: a.matricula,
    email: a.email,
    dataNascimento: a.dataNascimento ?? "",
    cpf: a.cpf ?? null,
    telefone: a.telefone ?? null,
    turno: a.turno ?? (a.turma?.turno as Turma["turno"]) ?? null,
    casaId: a.casa?.id ?? null,
    casa: a.casa ? { id: a.casa.id, nome: a.casa.nome } : null,
    turmaId: a.turma?.id ?? null,
    turma: a.turma
      ? {
          id: a.turma.id,
          serie: a.turma.serie,
          turno: a.turma.turno as Turma["turno"],
          ano: Number((a.turma as any).ano),
        }
      : null,
  });

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
  // 2.2 FORMATADORES DE DATA
  // =========================================================================

  // Front → Backend: dd/mm/yyyy → yyyy-mm-dd (Usada para salvar/editar)
  /*const frontToBackend = (dateString: string | undefined): string | null => {
    if (!dateString) return null;

    const match = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month}-${day}`;
    }
    return null;
  };*/

  // =========================================================================
  // 2.3 MAPEAMENTO DO ALUNO
  // =========================================================================
  const mapAlunoFromBackend = (a: any): AlunoFrontEnd => {
    const casaObj = a.casa
      ? { id: Number(a.casa.id), nome: a.casa.nome }
      : null;

    const turmaObj = a.turma
      ? {
          id: Number(a.turma.id),
          serie: a.turma.serie,
          turno: a.turma.turno,
          ano: a.turma.ano,
        }
      : null;

    return {
      id: Number(a.id),
      nome: a.nome ?? "",
      email: a.email ?? "",
      matricula: a.matricula ?? "",
      cpf: a.cpf,
      telefone: a.telefone ?? "",
      // 🟢 CORRIGIDO: Usando a função robusta para o formato DD/MM/AAAA na exibição
      dataNascimento: formatarDataISOParaBR(a.dataNascimento),
      casa: casaObj,
      turma: turmaObj,
      turno: a.turno ?? turmaObj?.turno ?? "",
    };
  };

  // =========================================================================
  // 2.4 CARREGAR ALUNOS
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
  // 2.5 DELETE
  // =========================================================================
  const handleDeleteConfirm = (id: number) => setConfirmDeleteId(id);

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);

    try {
      await deleteAluno(confirmDeleteId);
      setAlunos((prev) => prev.filter((a) => a.id !== confirmDeleteId));

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
  // 2.6 EDITAR
  // =========================================================================
  const handleOpenEdit = (aluno: AlunoFrontEnd) =>
    setAlunoEditando({ ...aluno });

  const handleCloseEdit = () => setAlunoEditando(null);

  // 🟢 CORREÇÃO: Receba o payload JÁ FILTRADO do modal e tipado como UpdateAlunoData
  const handleSaveEdit = async (payloadRecebido: UpdateAlunoData) => {
    // O payload já está filtrado, validado e no formato esperado pela API (YYYY-MM-DD)

    if (!alunoEditando) {
      // Verificação de segurança
      setSnackbar({
        open: true,
        message: "Erro: Aluno não selecionado.",
        severity: "error",
      });
      return;
    }

    // O ID do aluno deve ser passado separadamente, pois o payload não o contém.
    const alunoId = alunoEditando.id;

    try {
      // 🔴 REMOVIDO: A recriação e a chamada a frontToBackend
      // O payload recebido já está pronto.

      console.log(
        "PAYLOAD FINAL ENVIADO PARA API (EDIT):",
        JSON.stringify(payloadRecebido, null, 2)
      );

      // Usa o alunoId e o payloadRecebido diretamente
      const atualizadoServidor = await updateAluno(alunoId, payloadRecebido);
      const alunoMap = mapAlunoFromBackend(atualizadoServidor);

      setAlunos((prev) =>
        prev.map((a) => (a.id === alunoMap.id ? alunoMap : a))
      );

      setSnackbar({
        open: true,
        message: "Aluno atualizado com sucesso!",
        severity: "success",
      });

      handleCloseEdit();
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      // ... (tratamento de erro)
    }
  };

  // =========================================================================
  // 2.7 CRIAR
  // =========================================================================
  const handleCreateSave = async (dados: CreateAlunoData) => {
    try {
      const payload: CreateAlunoData = {
        ...dados,

        curso: undefined,
      };
      console.log(
        "PAYLOAD FINAL ENVIADO PARA API (CREATE):",
        JSON.stringify(payload, null, 2)
      );

      await createAluno(payload);
      setOpenCreateModal(false);
      await carregarAlunos();

      setSnackbar({
        open: true,
        message: "Aluno criado com sucesso!",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Erro ao criar aluno.",
        severity: "error",
      });
    }
  };

  // =========================================================================
  // 2.8 FILTRO
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
  // 2.9 RENDER
  // =========================================================================
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
          position: "relative",
          borderRadius: 2,
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
          Lista de Alunos
        </Typography>

        {/* Busca */}
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

        {/* Tabela */}
        <AlunosTable
          alunos={alunosFiltrados}
          deletingId={deletingId}
          onDelete={handleDeleteConfirm}
          onEdit={handleOpenEdit}
          loading={loading}
          searchQuery={debouncedTerm}
        />

        {/* Criar */}
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

      {/* Modal editar */}
      <EditarAlunoModal
        open={alunoEditando !== null}
        aluno={alunoEditando ? mapAlunoFrontToPropType(alunoEditando) : null}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
      />

      {/* Modal criar */}
      <CriarAlunoModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSave={handleCreateSave}
        onSuccess={carregarAlunos}
      />

      {/* Dialog excluir */}
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
