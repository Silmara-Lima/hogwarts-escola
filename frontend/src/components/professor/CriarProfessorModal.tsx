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

// Importa os tipos necessários (removi DisciplinaTurmaVinculo que não era usado)
import type {
  ProfessorCreateData,
  DisciplinaMinistrada,
} from "../../types/Professor";

// -----------------------------
// Departamentos (const + zod enum)
// -----------------------------
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

// -----------------------------
// Zod schema (validação do modal)
// -----------------------------
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
});

// -----------------------------
// Form types
// -----------------------------
interface FormDataType extends Omit<ProfessorCreateData, "departamento"> {
  departamento: Departamento | "";
  disciplinasIds: number[]; // ids selecionados
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
};

// -----------------------------
// Props do componente
// -----------------------------
interface CriarProfessorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (dados: ProfessorCreateData) => Promise<void>;
  onSuccess: () => void;
}

// -----------------------------
// Componente
// -----------------------------
export const CriarProfessorModal: React.FC<CriarProfessorModalProps> = ({
  open,
  onClose,
  onSave,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [disciplinasDisponiveis, setDisciplinasDisponiveis] = useState<
    DisciplinaMinistrada[]
  >([]);

  // Carrega disciplinas (simulação - aqui você pode chamar API)
  useEffect(() => {
    const fetchDisciplinas = async () => {
      try {
        // Substitua por chamada real ao serviço caso exista
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

    if (open) fetchDisciplinas();
  }, [open]);

  // -----------------------------
  // Handlers
  // -----------------------------
  // Text fields (nome, email, cpf, telefone, senha, matricula)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: FormDataType) => ({ ...prev, [name]: value }));
    setErrors((prev: Record<string, string | undefined>) => ({
      ...prev,
      [name]: undefined,
      geral: undefined,
    }));
  };

  // Departamento (single select)
  const handleDepartamentoChange = (e: SelectChangeEvent) => {
    const value = e.target.value as Departamento | "";
    setFormData((prev: FormDataType) => ({ ...prev, departamento: value }));
    setErrors((prev: Record<string, string | undefined>) => ({
      ...prev,
      departamento: undefined,
      geral: undefined,
    }));
  };

  // Disciplinas (multiple select) - MUI pode devolver string ou array, tratamos ambos
  const handleDisciplinasChange = (e: SelectChangeEvent<any>) => {
    const value = e.target.value;
    let disciplinaIds: number[] = [];

    if (Array.isArray(value)) {
      // Quando já é array
      disciplinaIds = value.map((v) => Number(v));
    } else if (typeof value === "string") {
      // Quando vem como CSV string
      disciplinaIds = value.split(",").map((s) => Number(s));
    } else {
      disciplinaIds = [];
    }

    setFormData((prev: FormDataType) => ({
      ...prev,
      disciplinasIds: disciplinaIds,
    }));

    setErrors((prev: Record<string, string | undefined>) => ({
      ...prev,
      disciplinasIds: undefined,
      geral: undefined,
    }));
  };

  // Submit
  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    // prepare payload (exclui disciplinasIds, pois o backend pode receber de outra forma)
    const { disciplinasIds, departamento, ...basicData } = formData;

    const rawPayload: ProfessorCreateData = {
      ...basicData,
      departamento: departamento as Departamento,
    };

    try {
      // validação zod
      createProfessorSchema.parse(rawPayload);

      // chama onSave (serviço que cria professor)
      await onSave(rawPayload);

      // sucesso: fecha modal e notifica pai
      onClose();
      onSuccess();
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          const key = issue.path[0] as string;
          fieldErrors[key] = issue.message;
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        setErrors((prev) => ({
          ...prev,
          geral: "Por favor, corrija os erros de validação.",
        }));
      } else if (err instanceof Error) {
        setErrors((prev) => ({ ...prev, geral: err.message }));
      } else {
        setErrors((prev) => ({
          ...prev,
          geral: "Erro desconhecido ao tentar criar o professor.",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    if (!loading) {
      setFormData(initialFormData);
      setErrors({});
      onClose();
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
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

            <FormControl fullWidth disabled={loading}>
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
