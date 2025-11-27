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
  FormControl,
  InputLabel,
  Select,
  Chip,
  FormHelperText,
  Alert,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { ZodError, z } from "zod";

// ==============================================
// MOCK DE DADOS / SERVIÇOS E CONSTANTES
// ==============================================

// MOCK: Definição de Turmas
const MOCK_TURMAS = [
  { id: 1, nome: "1º Ano" },
  { id: 2, nome: "2º Ano" },
  { id: 3, nome: "3º Ano" },
  { id: 4, nome: "4º Ano" },
];

// MOCK: Substitua pela sua chamada real ao backend
const getDisciplinas = async (): Promise<DisciplinaMinistrada[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    { id: 1, nome: "Poções I", turmas: [] },
    { id: 2, nome: "Feitiços Avançados", turmas: [] },
    { id: 3, nome: "História da Magia", turmas: [] },
    { id: 4, nome: "Herbologia", turmas: [] },
    { id: 5, nome: "Astronomia", turmas: [] },
    { id: 6, nome: "Aritmância", turmas: [] },
  ];
};

// ==============================================
// DEFINIÇÕES DE TIPOS E SCHEMA
// ==============================================

type DisciplinaMinistrada = {
  id: number;
  nome: string;
  turmas: { id: number; nome: string }[];
};

type DisciplinaTurmaVinculo = {
  disciplinaId: number;
  turmaId: number;
};

const departamentos = z.enum([
  "Poções",
  "Transfiguração",
  "Feitiços",
  "Adivinhação",
  "Defesa Contra as Artes das Trevas",
  "Estudos dos Trouxas",
]);

type Departamento = z.infer<typeof departamentos>;

type ProfessorDetalhe = {
  id: number;
  nome: string;
  email: string;
  departamento: string | null;
  telefone: string | null;
  cpf: string | null;
  matricula: string | null;
  disciplinasMinistradas: DisciplinaMinistrada[];
};

const updateDisciplinasSchema = z.object({
  turmaId: z.number({
    message: "A Turma é obrigatória para vincular disciplinas.",
  }),
  disciplinasIds: z
    .array(z.number())
    .min(1, { message: "Selecione pelo menos uma disciplina." }),
});

const updateProfessorSchema = z
  .object({
    nome: z
      .string()
      .min(3, "O nome deve ter pelo menos 3 caracteres.")
      .optional(),
    email: z.string().email("Formato de e-mail inválido.").optional(),
    senha: z
      .string()
      .min(6, "A nova senha deve ter no mínimo 6 caracteres.")
      .optional(),
    departamento: departamentos.nullable().optional(),
    telefone: z.string().max(15, "Telefone muito longo.").nullable().optional(),
    cpf: z
      .string()
      .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido.")
      .optional(),
    matricula: z.string().optional(),
  })
  .partial();

type UpdateProfessorData = z.infer<typeof updateProfessorSchema>;

interface FormDataType {
  nome: string;
  email: string;
  senha: string;
  departamento: Departamento | "";
  telefone: string;
  cpf: string;
  matricula: string;
  disciplinasIds: number[];
  turmaId: number | "";
}

const initialEmptyState: FormDataType = {
  nome: "",
  email: "",
  senha: "",
  departamento: "",
  telefone: "",
  cpf: "",
  matricula: "",
  disciplinasIds: [],
  turmaId: "",
};

interface EditarProfessorModalProps {
  open: boolean;
  onClose: () => void;
  professor: ProfessorDetalhe | null;
  onSave: (id: number, data: UpdateProfessorData) => Promise<void>;
  onUpdateDisciplinas: (
    id: number,
    data: DisciplinaTurmaVinculo[]
  ) => Promise<void>;
}

// ==============================================
// COMPONENTE PRINCIPAL
// ==============================================

export const EditarProfessorModal: React.FC<EditarProfessorModalProps> = ({
  open,
  onClose,
  professor,
  onSave,
  onUpdateDisciplinas,
}) => {
  const [formData, setFormData] = useState<FormDataType>(initialEmptyState);
  const [originalFormData, setOriginalFormData] = useState<FormDataType | null>(
    null
  );
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [disciplinasDisponiveis, setDisciplinasDisponiveis] = useState<
    DisciplinaMinistrada[]
  >([]);
  const [loadingDisciplinas, setLoadingDisciplinas] = useState(false);

  // BUSCA DISCIPLINAS
  useEffect(() => {
    const fetchDisciplinas = async () => {
      setLoadingDisciplinas(true);
      try {
        const data = await getDisciplinas();
        setDisciplinasDisponiveis(data);
      } catch (err) {
        console.error("Erro ao buscar disciplinas:", err);
      } finally {
        setLoadingDisciplinas(false);
      }
    };
    fetchDisciplinas();
  }, []);

  // INICIALIZA FORM
  useEffect(() => {
    if (!open || !professor) {
      setFormData(initialEmptyState);
      setOriginalFormData(null);
      setErrors({});
      return;
    }

    const disciplinasIds = professor.disciplinasMinistradas.map((d) => d.id);
    const turmaAtual = professor.disciplinasMinistradas[0]?.turmas[0]?.id ?? "";

    const initialData: FormDataType = {
      nome: professor.nome ?? "",
      email: professor.email ?? "",
      senha: "",
      departamento: (professor.departamento as Departamento) ?? "",
      telefone: professor.telefone ?? "",
      cpf: professor.cpf ?? "",
      matricula: professor.matricula ?? "",
      disciplinasIds,
      turmaId: turmaAtual,
    };

    setFormData(initialData);
    setOriginalFormData(initialData);
  }, [open, professor]);

  // HANDLERS --------------------------------------

  const handleInputChange = (
    field: keyof Omit<FormDataType, "turmaId" | "disciplinasIds">,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, geral: undefined }));
  };

  const handleTurmaChange = (e: SelectChangeEvent) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      turmaId: value === "" ? "" : Number(value),
    }));
    setErrors((prev) => ({ ...prev, turmaId: undefined, geral: undefined }));
  };

  const handleDisciplinasChange = (e: SelectChangeEvent<number[]>) => {
    const value = e.target.value;
    const newDisciplinasIds =
      typeof value === "string" ? value.split(",").map(Number) : value;

    setFormData((prev) => ({
      ...prev,
      disciplinasIds: newDisciplinasIds,
    }));

    setErrors((prev) => ({
      ...prev,
      disciplinasIds: undefined,
      geral: undefined,
    }));
  };

  const handleBlur = (_field: keyof FormDataType) => {
    // Você pode adicionar validação pontual aqui depois
  };

  // SUBMISSÃO -------------------------------------

  const handleSubmit = async () => {
    if (!professor || !originalFormData) return;

    setLoading(true);
    setErrors({});

    const {
      disciplinasIds: currentDisciplinasIds,
      turmaId: currentTurmaId,
      senha,
      ...basicFormData
    } = formData;

    let rawBasicPayload: UpdateProfessorData = {
      nome: basicFormData.nome,
      email: basicFormData.email,
      cpf: basicFormData.cpf,
      matricula: basicFormData.matricula,
      departamento:
        basicFormData.departamento === "" ? null : basicFormData.departamento,
      telefone: basicFormData.telefone === "" ? null : basicFormData.telefone,
    };

    if (senha !== "") rawBasicPayload.senha = senha;

    const originalDisciplinasIds = originalFormData.disciplinasIds;
    const originalTurmaId = originalFormData.turmaId;

    let basicPayloadToSend: UpdateProfessorData = {};
    let allValid = true;
    let newFieldErrors: Record<string, string> = {};

    try {
      updateProfessorSchema.parse(rawBasicPayload);

      updateDisciplinasSchema.parse({
        turmaId: currentTurmaId,
        disciplinasIds: currentDisciplinasIds,
      });

      Object.entries(rawBasicPayload).forEach(([key, value]) => {
        const originalValue = originalFormData[key as keyof FormDataType];

        const current = value ?? "";
        const original = originalValue ?? "";

        if (key === "senha" && value) {
          basicPayloadToSend.senha = value as string;
        } else if (current !== original) {
          basicPayloadToSend[key as keyof UpdateProfessorData] = value as any;
        }
      });
    } catch (err) {
      if (err instanceof ZodError) {
        err.issues.forEach((issue) => {
          newFieldErrors[issue.path[0] as string] = issue.message;
        });
        setErrors(newFieldErrors);
        allValid = false;
      } else {
        setErrors({ geral: "Erro de validação desconhecido." });
        allValid = false;
      }
    }

    if (!allValid) {
      setLoading(false);
      return;
    }

    const hasBasicChanges = Object.keys(basicPayloadToSend).length > 0;

    const isTurmaChanged = currentTurmaId !== originalTurmaId;
    const isDisciplinasChanged =
      JSON.stringify(currentDisciplinasIds.sort()) !==
      JSON.stringify(originalDisciplinasIds.sort());

    const hasDisciplinaChanges = isTurmaChanged || isDisciplinasChanged;

    if (!hasBasicChanges && !hasDisciplinaChanges) {
      setErrors({ geral: "Nenhuma alteração detectada para salvar." });
      setLoading(false);
      return;
    }

    try {
      if (hasBasicChanges) {
        await onSave(professor.id, basicPayloadToSend);
      }

      if (hasDisciplinaChanges) {
        const vinculosParaEnviar: DisciplinaTurmaVinculo[] =
          currentDisciplinasIds.map((discId) => ({
            disciplinaId: discId,
            turmaId: currentTurmaId as number,
          }));

        await onUpdateDisciplinas(professor.id, vinculosParaEnviar);
      }

      onClose();
    } catch (apiError: any) {
      const apiMsg =
        apiError?.message ||
        apiError.response?.data?.message ||
        "Erro ao salvar. Verifique o console.";
      setErrors({ geral: apiMsg });
    } finally {
      setLoading(false);
    }
  };

  const hasValidationErrors = Object.values(errors).some((err) => !!err);

  const isSaveDisabled =
    loading ||
    hasValidationErrors ||
    !!errors.turmaId ||
    !!errors.disciplinasIds;

  if (!professor) return null;

  // RENDER ----------------------------------------

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: "primary.main", fontWeight: 600 }}>
        Editar Professor — {professor.nome} ✏️
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {errors.geral && <Alert severity="error">{errors.geral}</Alert>}

          {/* Nome e Matrícula */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Nome Completo"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              onBlur={() => handleBlur("nome")}
              error={!!errors.nome}
              helperText={errors.nome}
              fullWidth
              required
              disabled={loading}
            />

            <TextField
              label="Matrícula"
              value={formData.matricula}
              onChange={(e) => handleInputChange("matricula", e.target.value)}
              onBlur={() => handleBlur("matricula")}
              error={!!errors.matricula}
              helperText={errors.matricula}
              fullWidth
              disabled={loading}
            />
          </Box>

          {/* CPF e Telefone */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="CPF"
              value={formData.cpf}
              onChange={(e) => handleInputChange("cpf", e.target.value)}
              onBlur={() => handleBlur("cpf")}
              error={!!errors.cpf}
              helperText={errors.cpf}
              fullWidth
              disabled={loading}
            />

            <TextField
              label="Telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange("telefone", e.target.value)}
              onBlur={() => handleBlur("telefone")}
              error={!!errors.telefone}
              helperText={errors.telefone}
              fullWidth
              disabled={loading}
            />
          </Box>

          {/* Email e Senha */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              required
              disabled={loading}
            />

            <TextField
              label="Nova Senha (opcional)"
              type="password"
              value={formData.senha}
              onChange={(e) => handleInputChange("senha", e.target.value)}
              onBlur={() => handleBlur("senha")}
              error={!!errors.senha}
              helperText={
                errors.senha ||
                "Mínimo 6 caracteres. Preencha apenas para alterar."
              }
              fullWidth
              disabled={loading}
            />
          </Box>

          {/* Departamento e Turma */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl
              fullWidth
              required
              disabled={loading}
              error={!!errors.departamento}
            >
              <InputLabel>Departamento</InputLabel>
              <Select
                value={formData.departamento}
                onChange={(e) =>
                  handleInputChange("departamento", e.target.value)
                }
                onBlur={() => handleBlur("departamento")}
                label="Departamento"
              >
                <MenuItem value="">
                  <em>Selecione</em>
                </MenuItem>
                {departamentos.options.map((dep) => (
                  <MenuItem key={dep} value={dep}>
                    {dep}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.departamento || " "}</FormHelperText>
            </FormControl>

            {/* Turma */}
            <FormControl
              fullWidth
              required
              disabled={loading}
              error={!!errors.turmaId}
            >
              <InputLabel id="turma-label">Turma</InputLabel>
              <Select
                labelId="turma-label"
                value={formData.turmaId.toString()}
                onChange={handleTurmaChange}
                label="Turma"
              >
                <MenuItem value="">
                  <em>Nenhuma</em>
                </MenuItem>
                {MOCK_TURMAS.map((turma) => (
                  <MenuItem key={turma.id} value={turma.id}>
                    {turma.nome}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.turmaId || " "}</FormHelperText>
            </FormControl>
          </Box>

          {/* Disciplinas */}
          <FormControl
            fullWidth
            disabled={loading || loadingDisciplinas}
            error={!!errors.disciplinasIds}
          >
            <InputLabel>Disciplinas Ministradas</InputLabel>
            <Select
              multiple
              value={formData.disciplinasIds}
              onChange={handleDisciplinasChange}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {disciplinasDisponiveis
                    .filter((d) => selected.includes(d.id))
                    .map((d) => (
                      <Chip key={d.id} label={d.nome} />
                    ))}
                </Box>
              )}
              label="Disciplinas Ministradas"
            >
              {loadingDisciplinas ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : (
                disciplinasDisponiveis.map((disciplina) => (
                  <MenuItem key={disciplina.id} value={disciplina.id}>
                    {disciplina.nome}
                  </MenuItem>
                ))
              )}
            </Select>
            <FormHelperText>{errors.disciplinasIds || " "}</FormHelperText>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSaveDisabled}
        >
          {loading ? <CircularProgress size={20} /> : "Salvar Alterações"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
