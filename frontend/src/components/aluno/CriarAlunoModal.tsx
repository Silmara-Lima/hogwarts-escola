import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { ZodError } from "zod";
import {
  createAlunoSchema,
  type CreateAlunoData,
  type Turno,
} from "../../schemas/AlunoSchema";
import { createAluno } from "../../services/AlunosService";

type Casa = { id: number; nome: string };
type Turma = { id: number; serie: string; turno: Turno; ano: number };

interface CriarAlunoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (novoAluno: any) => void;
}

const parseDateToISO = (dateStr: string) => {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString().split("T")[0];
};

export const CriarAlunoModal = ({
  open,
  onClose,
  onSave,
}: CriarAlunoModalProps) => {
  const [formData, setFormData] = useState<CreateAlunoData>({
    nome: "",
    matricula: "",
    email: "",
    senha: "",
    turno: "" as Turno,
    casaId: "" as number | "",
    turmaId: "" as number | "",
    dataNascimento: "",
    telefone: "",
    cpf: "",
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [casas, setCasas] = useState<Casa[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "success";
  }>({ open: false, message: "", severity: "error" });

  const loadData = async () => {
    setLoadingData(true);
    try {
      setCasas([
        { id: 1, nome: "Grifinória" },
        { id: 2, nome: "Sonserina" },
        { id: 3, nome: "Lufa-Lufa" },
        { id: 4, nome: "Corvinal" },
      ]);
      setTurmas([
        { id: 1, serie: "1º Ano", turno: "MATUTINO", ano: 2025 },
        { id: 2, serie: "2º Ano", turno: "MATUTINO", ano: 2025 },
        { id: 3, serie: "3º Ano", turno: "VESPERTINO", ano: 2025 },
        { id: 4, serie: "4º Ano", turno: "VESPERTINO", ano: 2025 },
      ]);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
      setFormData({
        nome: "",
        matricula: "",
        email: "",
        senha: "",
        turno: "" as Turno,
        casaId: "" as number | "",
        turmaId: "" as number | "",
        dataNascimento: "",
        telefone: "",
        cpf: "",
      });
      setErrors({});
      setTouched({});
      setSnackbar({ ...snackbar, open: false });
    }
  }, [open]);

  const handleInputChange = (
    field: keyof CreateAlunoData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "casaId" || field === "turmaId"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
    if (touched[field]) handleBlur(field);
  };

  const handleBlur = (field: keyof CreateAlunoData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    try {
      createAlunoSchema
        .pick({ [field]: true })
        .parse({ [field]: formData[field] });
      setErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors((prev) => ({ ...prev, [field]: err.issues[0].message }));
      }
    }
  };

  const handleSubmit = async () => {
    const payload: CreateAlunoData = {
      ...formData,
      casaId: formData.casaId === "" ? null : Number(formData.casaId),
      turmaId: formData.turmaId === "" ? null : Number(formData.turmaId),
      dataNascimento: parseDateToISO(formData.dataNascimento),
      email: formData.email?.trim() || "",
      cpf: formData.cpf?.trim() || "",
      matricula: formData.matricula?.trim() || "",
    };

    setErrors({});
    setSnackbar({ ...snackbar, open: false });

    try {
      createAlunoSchema.parse(payload);
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          const key = issue.path[0] as string;
          fieldErrors[key] = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    if (!payload.turmaId) {
      setErrors((prev) => ({
        ...prev,
        turmaId: "Selecione a turma (obrigatório).",
      }));
      return;
    }

    setLoading(true);

    try {
      const novoAluno = await createAluno(payload);
      onSave(novoAluno);
      setSnackbar({
        open: true,
        message: "Aluno criado com sucesso!",
        severity: "success",
      });
      onClose();
    } catch (error: any) {
      console.error("Erro ao criar aluno:", error);
      const msg =
        error?.response?.data?.message ||
        (error?.response?.status
          ? `Erro ao criar aluno (status ${error.response.status}).`
          : "Erro de comunicação com o servidor.");
      setSnackbar({ open: true, message: msg, severity: "error" });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Criar Aluno</DialogTitle>
        <DialogContent>
          {loadingData ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              <TextField
                label="Nome"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                onBlur={() => handleBlur("nome")}
                error={!!errors.nome}
                helperText={errors.nome}
                fullWidth
              />
              <TextField
                label="Data de Nascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={(e) =>
                  handleInputChange("dataNascimento", e.target.value)
                }
                onBlur={() => handleBlur("dataNascimento")}
                error={!!errors.dataNascimento}
                helperText={errors.dataNascimento}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
              />
              <TextField
                label="CPF"
                value={formData.cpf}
                onChange={(e) => handleInputChange("cpf", e.target.value)}
                onBlur={() => handleBlur("cpf")}
                error={!!errors.cpf}
                helperText={errors.cpf}
                fullWidth
              />
              <TextField
                label="Telefone"
                value={formData.telefone ?? ""}
                onChange={(e) => handleInputChange("telefone", e.target.value)}
                onBlur={() => handleBlur("telefone")}
                error={!!errors.telefone}
                helperText={errors.telefone}
                fullWidth
              />
              <TextField
                label="Senha"
                type="password"
                value={formData.senha}
                onChange={(e) => handleInputChange("senha", e.target.value)}
                onBlur={() => handleBlur("senha")}
                error={!!errors.senha}
                helperText={errors.senha}
                fullWidth
              />
              <TextField
                label="Matrícula"
                value={formData.matricula}
                onChange={(e) => handleInputChange("matricula", e.target.value)}
                onBlur={() => handleBlur("matricula")}
                error={!!errors.matricula}
                helperText={errors.matricula}
                fullWidth
              />
              <TextField
                select
                label="Turno"
                value={formData.turno || ""}
                onChange={(e) => handleInputChange("turno", e.target.value)}
                onBlur={() => handleBlur("turno")}
                error={!!errors.turno}
                helperText={errors.turno}
                fullWidth
              >
                <MenuItem value="">
                  <em>Selecione o Turno</em>
                </MenuItem>
                {["MATUTINO", "VESPERTINO", "NOTURNO"].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Casa"
                value={formData.casaId || ""}
                onChange={(e) => handleInputChange("casaId", e.target.value)}
                onBlur={() => handleBlur("casaId")}
                error={!!errors.casaId}
                helperText={errors.casaId}
                fullWidth
              >
                <MenuItem value="">
                  <em>Sem Casa</em>
                </MenuItem>
                {casas.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nome}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Turma"
                value={formData.turmaId || ""}
                onChange={(e) => handleInputChange("turmaId", e.target.value)}
                onBlur={() => handleBlur("turmaId")}
                error={!!errors.turmaId}
                helperText={errors.turmaId}
                fullWidth
              >
                <MenuItem value="">
                  <em>Selecione a Turma</em>
                </MenuItem>
                {turmas.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.serie} - {t.turno} ({t.ano})
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} variant="contained">
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Criar Aluno"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
