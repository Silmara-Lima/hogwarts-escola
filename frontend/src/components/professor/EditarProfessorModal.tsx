import { useState, useEffect } from "react";
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
  type SelectChangeEvent,
  Alert,
} from "@mui/material";
import { ZodError, z } from "zod";

// Importa os tipos centralizados para evitar conflitos e duplicação
import type {
  ProfessorDetalhe,
  DisciplinaTurmaVinculo,
  DisciplinaMinistrada,
} from "../../types/Professor";

// Importe sua função de serviço aqui
// import { getDisciplinas } from "../../services/DisciplinaService";

// ==============================================
// DEFINIÇÕES DE TIPOS E SCHEMA
// ==============================================

const departamentos = z.enum([
  "Poções",
  "Transfiguração",
  "Feitiços",
  "Adivinhação",
  "Defesa Contra as Artes das Trevas",
  "Estudos dos Trouxas",
]);
type Departamento = z.infer<typeof departamentos>;

const TURMA_PADRAO_ID = 1;

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
// COMPONENTE
// ==============================================
export const EditarProfessorModal = ({
  open,
  onClose,
  professor,
  onSave,
  onUpdateDisciplinas,
}: EditarProfessorModalProps) => {
  const [formData, setFormData] = useState<FormDataType>(initialEmptyState);
  const [originalFormData, setOriginalFormData] = useState<FormDataType | null>(
    null
  );
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);

  // CORREÇÃO: Usando o tipo DisciplinaMinistrada[] importado
  const [disciplinasDisponiveis, setDisciplinasDisponiveis] = useState<
    DisciplinaMinistrada[]
  >([]);

  // ==============================================
  // BUSCA DISCIPLINAS DO BACKEND
  // ==============================================
  useEffect(() => {
    // ATENÇÃO: A função getDisciplinas() precisa estar importada/definida e retornar Promise<DisciplinaMinistrada[]>
    const fetchDisciplinas = async () => {
      try {
        // Exemplo:
        // const data: DisciplinaMinistrada[] = await getDisciplinas();

        // Simulação de dados para evitar erro de referência, se 'getDisciplinas' não existir:
        const data: DisciplinaMinistrada[] = [
          { id: 1, nome: "Poções I", turmas: [] },
          { id: 2, nome: "Feitiços Avançados", turmas: [] },
          { id: 3, nome: "História da Magia", turmas: [] },
        ];

        setDisciplinasDisponiveis(data);
      } catch (err) {
        console.error("Erro ao buscar disciplinas:", err);
      }
    };
    fetchDisciplinas();
  }, []);

  // ==============================================
  // INICIALIZAÇÃO DO FORM
  // ==============================================
  useEffect(() => {
    if (!open || !professor) {
      setFormData(initialEmptyState);
      setOriginalFormData(null);
      setErrors({});
      return;
    }

    const disciplinasIds = professor.disciplinasMinistradas.map((d) => d.id);

    const initialData: FormDataType = {
      nome: professor.nome ?? "",
      email: professor.email ?? "",
      senha: "",
      departamento: (professor.departamento as Departamento) ?? "",
      telefone: professor.telefone ?? "",
      cpf: professor.cpf ?? "",
      matricula: professor.matricula ?? "",
      disciplinasIds,
    };

    setFormData(initialData);
    setOriginalFormData(initialData);
  }, [open, professor]);

  // ==============================================
  // HANDLERS DE INPUT
  // ==============================================
  const handleInputChange = (
    field: keyof FormDataType,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, geral: undefined }));
  };

  const handleDisciplinasChange = (e: SelectChangeEvent<number[]>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      disciplinasIds:
        typeof value === "string"
          ? value.split(",").map(Number)
          : (value as number[]),
    }));
    setErrors((prev) => ({
      ...prev,
      disciplinasIds: undefined,
      geral: undefined,
    }));
  };

  const handleBlur = (field: keyof UpdateProfessorData) => {
    try {
      let valueToValidate: any = formData[field as keyof FormDataType];
      if (["telefone", "departamento", "cpf", "matricula"].includes(field)) {
        valueToValidate = valueToValidate === "" ? null : valueToValidate;
      }
      if (field === "senha" && valueToValidate === "") return;
      if (valueToValidate === null) return;

      updateProfessorSchema
        .pick({ [field]: true })
        .parse({ [field]: valueToValidate });
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors((prev) => ({ ...prev, [field]: err.issues[0].message }));
      }
    }
  };

  // ==============================================
  // SUBMISSÃO
  // ==============================================
  const handleSubmit = async () => {
    if (!professor || !originalFormData) return;
    setLoading(true);
    setErrors({});

    const {
      disciplinasIds: currentDisciplinasIds,
      senha,
      ...basicFormData
    } = formData;

    let rawBasicPayload: UpdateProfessorData = {
      nome: basicFormData.nome,
      email: basicFormData.email,
      cpf: basicFormData.cpf,
      matricula: basicFormData.matricula,
      departamento:
        basicFormData.departamento === ""
          ? null
          : (basicFormData.departamento as Departamento),
      telefone: basicFormData.telefone === "" ? null : basicFormData.telefone,
    };
    if (senha !== "") rawBasicPayload.senha = senha;

    let basicPayloadToSend: UpdateProfessorData = {};
    try {
      updateProfessorSchema.parse(rawBasicPayload);
      Object.entries(rawBasicPayload).forEach(([key, value]) => {
        const originalValue = originalFormData[key as keyof FormDataType];
        const current = value === null ? "" : value;
        const original = originalValue === null ? "" : originalValue;
        if (key === "senha" && value) {
          basicPayloadToSend.senha = value as string;
        } else if (current !== original) {
          basicPayloadToSend[key as keyof UpdateProfessorData] = value as any;
        }
      });
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          const key = issue.path[0] as string;
          fieldErrors[key] = issue.message;
        });
        setErrors(fieldErrors);
        setLoading(false);
        return;
      }
      setErrors({ geral: "Erro de validação desconhecido." });
      setLoading(false);
      return;
    }

    const originalDisciplinasIds = originalFormData.disciplinasIds || [];
    const hasDisciplinaChanges =
      JSON.stringify(currentDisciplinasIds.sort()) !==
      JSON.stringify(originalDisciplinasIds.sort());
    const hasBasicChanges = Object.keys(basicPayloadToSend).length > 0;

    if (!hasBasicChanges && !hasDisciplinaChanges) {
      setErrors({ geral: "Nenhuma alteração detectada para salvar." });
      setLoading(false);
      return;
    }

    try {
      if (hasBasicChanges) await onSave(professor.id, basicPayloadToSend);

      if (hasDisciplinaChanges) {
        const vinculosParaEnviar: DisciplinaTurmaVinculo[] =
          currentDisciplinasIds.map((discId) => ({
            disciplinaId: discId,
            turmaId: TURMA_PADRAO_ID,
          }));
        await onUpdateDisciplinas(professor.id, vinculosParaEnviar);
      }
    } catch (apiError: any) {
      const apiMsg =
        apiError.response?.data?.message ||
        apiError.message ||
        "Erro ao salvar.";
      setErrors({ geral: apiMsg });
    } finally {
      setLoading(false);
    }
  };

  const hasValidationErrors = Object.values(errors).some((err) => !!err);
  const isSaveDisabled = loading || hasValidationErrors;

  if (!professor) return null;

  // ==============================================
  // RENDERIZAÇÃO
  // ==============================================
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: "primary.main", fontWeight: 600 }}>
        Editar Professor — {professor.nome} ✏️
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {errors.geral && <Alert severity="error">{errors.geral}</Alert>}

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

            <FormControl fullWidth disabled={loading}>
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
                {disciplinasDisponiveis.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.nome}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>&nbsp;</FormHelperText>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSaveDisabled}
        >
          {loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
