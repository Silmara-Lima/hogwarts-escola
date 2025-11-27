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
  Alert,
  type SelectChangeEvent,
} from "@mui/material";
import { ZodError, z } from "zod";

import type {
  ProfessorCreateData,
  DisciplinaMinistrada,
  DisciplinaTurmaVinculo,
} from "../../types/Professor";

import {
  createProfessor,
  vincularDisciplinas,
} from "../../services/ProfessorService";
import { getDisciplinas } from "../../services/DisciplinaService";

// =========================================================================
// MOCK DE TURMAS
// =========================================================================
const MOCK_TURMAS = [
  { id: 1, nome: "1º Ano" },
  { id: 2, nome: "2º Ano" },
  { id: 3, nome: "3º Ano" },
  { id: 4, nome: "4º Ano" },
];

// =========================================================================
// Departamentos
// =========================================================================
const DEPARTAMENTOS = [
  "Poções",
  "Transfiguração",
  "Feitiços",
  "Adivinhação",
  "Defesa Contra as Artes das Trevas",
  "Estudos dos Trouxas",
] as const;

const departamentos = z.enum(DEPARTAMENTOS);
type Departamento = z.infer<typeof departamentos>;

// =========================================================================
// Schema Zod (validação)
// =========================================================================
const createProfessorSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Formato de e-mail inválido."),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
  departamento: departamentos,
  telefone: z
    .string()
    .min(8, "Telefone inválido.")
    .max(15, "Telefone muito longo."),
  cpf: z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido."),
  matricula: z.string().min(3, "Matrícula é obrigatória."),
  turmaId: z.number({ message: "A Turma é obrigatória." }),
  disciplinasIds: z
    .array(z.number())
    .min(1, "Selecione pelo menos uma disciplina."),
});

// =========================================================================
// Tipagem do Formulário
// =========================================================================
interface FormDataType extends Omit<ProfessorCreateData, "departamento"> {
  departamento: Departamento | "";
  turmaId: number | "";
  disciplinasIds: number[];
}

const initialFormData: FormDataType = {
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

// =========================================================================
// Props do componente
// =========================================================================
interface CriarProfessorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (dados: ProfessorCreateData) => Promise<void>;
  onSuccess: () => Promise<void>;
}

// =========================================================================
// Componente
// =========================================================================
export const CriarProfessorModal: React.FC<CriarProfessorModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [disciplinasDisponiveis, setDisciplinasDisponiveis] = useState<
    DisciplinaMinistrada[]
  >([]);
  const [loadingDisciplinas, setLoadingDisciplinas] = useState(false);

  // =========================================================================
  // Buscar disciplinas
  // =========================================================================
  useEffect(() => {
    const fetchDisciplinas = async () => {
      setLoadingDisciplinas(true);
      try {
        const data = await getDisciplinas();
        const disciplinasFormatadas: DisciplinaMinistrada[] = data.map((d) => ({
          id: d.id,
          nome: d.nome,
          turmas: [],
        }));
        setDisciplinasDisponiveis(disciplinasFormatadas);
      } catch (err) {
        console.error("Erro ao buscar disciplinas:", err);
        setErrors((prev) => ({
          ...prev,
          geral: "Falha ao carregar as disciplinas. Tente recarregar a página.",
        }));
      } finally {
        setLoadingDisciplinas(false);
      }
    };

    if (open) fetchDisciplinas();
  }, [open]);

  // =========================================================================
  // Handlers
  // =========================================================================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: FormDataType) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, geral: undefined }));
  };

  const handleDepartamentoChange = (e: SelectChangeEvent) => {
    const value = e.target.value as Departamento | "";
    setFormData((prev) => ({ ...prev, departamento: value }));
    setErrors((prev) => ({
      ...prev,
      departamento: undefined,
      geral: undefined,
    }));
  };

  const handleDisciplinasChange = (e: SelectChangeEvent<any>) => {
    const value = e.target.value;
    let disciplinaIds: number[] = [];

    if (Array.isArray(value)) disciplinaIds = value.map(Number);
    else if (typeof value === "string")
      disciplinaIds = value.split(",").map(Number);

    setFormData((prev) => ({ ...prev, disciplinasIds: disciplinaIds }));
    setErrors((prev) => ({
      ...prev,
      disciplinasIds: undefined,
      geral: undefined,
    }));
  };

  const handleTurmaChange = (e: SelectChangeEvent) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, turmaId: Number(value) }));
    setErrors((prev) => ({ ...prev, turmaId: undefined, geral: undefined }));
  };

  const handleModalClose = () => {
    if (!loading) {
      setFormData(initialFormData);
      setErrors({});
      onClose();
    }
  };

  // =========================================================================
  // Submit (Fluxo em duas etapas)
  // =========================================================================
  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    const { disciplinasIds, turmaId, departamento, ...basicData } = formData;

    const validationPayload = {
      ...basicData,
      departamento: departamento as Departamento,
      turmaId: turmaId as number,
      disciplinasIds,
    };

    const creationPayload: ProfessorCreateData = {
      ...basicData,
      departamento: departamento as Departamento,
    };

    try {
      createProfessorSchema.parse(validationPayload);

      const newProfessor = await createProfessor(creationPayload);
      const professorId = newProfessor.id;

      const vinculos: DisciplinaTurmaVinculo[] = disciplinasIds.map((dId) => ({
        disciplinaId: dId,
        turmaId: turmaId as number,
      }));

      await vincularDisciplinas(professorId, vinculos);

      onClose();
      onSuccess();
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          const key = issue.path[0] as string;
          fieldErrors[key] = issue.message;
        });
        setErrors((prev) => ({
          ...prev,
          ...fieldErrors,
          geral: "Por favor, corrija os erros de validação.",
        }));
      } else {
        console.error("Erro ao criar/vincular professor:", err);
        const errorMessage =
          (err as any)?.response?.data?.message ||
          (err as Error).message ||
          "Erro desconhecido ao tentar criar o professor.";
        setErrors((prev) => ({ ...prev, geral: errorMessage }));
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // Render
  // =========================================================================
  return (
    <Dialog open={open} onClose={handleModalClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: "primary.main", fontWeight: 600 }}>
        Novo Professor ✨
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {errors.geral && <Alert severity="error">{errors.geral}</Alert>}

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              name="nome"
              label="Nome Completo"
              value={formData.nome}
              onChange={handleInputChange}
              error={!!errors.nome}
              helperText={errors.nome}
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              name="matricula"
              label="Matrícula"
              value={formData.matricula}
              onChange={handleInputChange}
              error={!!errors.matricula}
              helperText={errors.matricula}
              fullWidth
              required
              disabled={loading}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              name="cpf"
              label="CPF"
              value={formData.cpf}
              onChange={handleInputChange}
              error={!!errors.cpf}
              helperText={errors.cpf}
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              name="telefone"
              label="Telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              error={!!errors.telefone}
              helperText={errors.telefone}
              fullWidth
              required
              disabled={loading}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              name="senha"
              label="Senha"
              type="password"
              value={formData.senha}
              onChange={handleInputChange}
              error={!!errors.senha}
              helperText={errors.senha || "Mínimo 6 caracteres."}
              fullWidth
              required
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
              <InputLabel id="departamento-label">Departamento</InputLabel>
              <Select
                labelId="departamento-label"
                value={formData.departamento}
                onChange={handleDepartamentoChange}
                label="Departamento"
              >
                <MenuItem value="">
                  <em>Nenhum</em>
                </MenuItem>
                {DEPARTAMENTOS.map((dep) => (
                  <MenuItem key={dep} value={dep}>
                    {dep}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.departamento || " "}</FormHelperText>
            </FormControl>

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

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl
              fullWidth
              error={!!errors.disciplinasIds}
              disabled={loading || loadingDisciplinas}
            >
              <InputLabel id="disciplinas-label">Disciplinas</InputLabel>
              <Select
                labelId="disciplinas-label"
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
                label="Disciplinas"
              >
                {loadingDisciplinas ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} /> Carregando
                    Disciplinas...
                  </MenuItem>
                ) : (
                  disciplinasDisponiveis.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.nome}
                    </MenuItem>
                  ))
                )}
              </Select>
              <FormHelperText>{errors.disciplinasIds || " "}</FormHelperText>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleModalClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !!errors.geral}
        >
          {loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            "Criar Professor"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
