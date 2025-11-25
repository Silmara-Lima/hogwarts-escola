import { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";

// ======================================================================
// TIPOS E CONSTANTES
// ======================================================================

type Turno = "Matutino" | "Vespertino" | "Noturno" | "Integral";

interface TurmaOpcao {
  id: number;
  nome: string;
}

interface DisciplinaOpcao {
  id: number;
  nome: string;
}

type SelectCustomValue = number | string | "";

interface AddDisciplinaTurmaData {
  disciplinaId?: number;
  nomeDisciplina: string;
  turmaId?: number;
  nomeTurma: string;
  turno: Turno;
}

interface AdicionarDisciplinaTurmaModalProps {
  open: boolean;
  onClose: () => void;
  professorId: number;
  onAdd: (id: number, dados: AddDisciplinaTurmaData) => Promise<void>;
  availableTurnos: Turno[];
  existingDisciplinas: DisciplinaOpcao[];
  existingTurmas: TurmaOpcao[];
}

const NEW_OPTION_VALUE = "NOVA_OPCAO_CUSTOMIZADA";

// ======================================================================
// COMPONENTE: AdicionarDisciplinaTurmaModal
// ======================================================================

export const AdicionarDisciplinaTurmaModal = ({
  open,
  onClose,
  professorId,
  onAdd,
  availableTurnos,
  existingDisciplinas,
  existingTurmas,
}: AdicionarDisciplinaTurmaModalProps) => {
  const [selectedDiscipline, setSelectedDiscipline] =
    useState<SelectCustomValue>("");
  const [selectedTurma, setSelectedTurma] = useState<SelectCustomValue>("");

  const [formData, setFormData] = useState<AddDisciplinaTurmaData>({
    nomeDisciplina: "",
    nomeTurma: "",
    turno: availableTurnos[0] || ("Matutino" as Turno),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFormData({
        nomeDisciplina: "",
        nomeTurma: "",
        turno: availableTurnos[0] || ("Matutino" as Turno),
        disciplinaId: undefined,
        turmaId: undefined,
      });
      setSelectedDiscipline("");
      setSelectedTurma("");
      setError(null);
    }
  }, [open, availableTurnos]);

  const handleNewNameChange = (
    field: "nomeDisciplina" | "nomeTurma",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTurnoChange = (e: SelectChangeEvent<Turno>) => {
    setFormData((prev) => ({ ...prev, turno: e.target.value as Turno }));
  };

  const handleDisciplineSelectChange = (
    e: SelectChangeEvent<SelectCustomValue>
  ) => {
    const value = e.target.value as SelectCustomValue;
    setSelectedDiscipline(value);

    if (value === NEW_OPTION_VALUE || value === "") {
      setFormData((prev) => ({
        ...prev,
        disciplinaId: undefined,
        nomeDisciplina: "",
      }));
    } else {
      const id = Number(value);
      const discipline = existingDisciplinas.find((d) => d.id === id);
      setFormData((prev) => ({
        ...prev,
        disciplinaId: id,
        nomeDisciplina: discipline?.nome || "",
      }));
    }
  };

  const handleTurmaSelectChange = (e: SelectChangeEvent<SelectCustomValue>) => {
    const value = e.target.value as SelectCustomValue;
    setSelectedTurma(value);

    if (value === NEW_OPTION_VALUE || value === "") {
      setFormData((prev) => ({
        ...prev,
        turmaId: undefined,
        nomeTurma: "",
      }));
    } else {
      const id = Number(value);
      const turma = existingTurmas.find((t) => t.id === id);
      setFormData((prev) => ({
        ...prev,
        turmaId: id,
        nomeTurma: turma?.nome || "",
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!formData.nomeDisciplina || !formData.nomeTurma || !formData.turno) {
      setError(
        "Todos os campos são obrigatórios. Selecione ou preencha a disciplina, a turma e o turno."
      );
      setLoading(false);
      return;
    }

    try {
      await onAdd(professorId, formData);
      onClose();
    } catch (err: any) {
      console.error("Erro ao adicionar disciplina/turma:", err);
      setError(
        err.message ||
          "Falha ao adicionar. Verifique os dados e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    !!formData.nomeDisciplina && !!formData.nomeTurma && !!formData.turno;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="text-blue-700">
        Adicionar Nova Disciplina e Turma ➕
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {/* DISCIPLINA */}
          <Typography variant="subtitle2" sx={{ color: "gray" }}>
            Disciplina *
          </Typography>

          <FormControl fullWidth required>
            <InputLabel id="disciplina-select-label">
              Selecione ou adicione uma Disciplina
            </InputLabel>

            <Select
              labelId="disciplina-select-label"
              value={selectedDiscipline}
              label="Selecione ou adicione uma Disciplina"
              onChange={handleDisciplineSelectChange}
            >
              <MenuItem value={"" as SelectCustomValue} disabled>
                <em>Selecione uma opção</em>
              </MenuItem>

              {existingDisciplinas.map((d) => (
                <MenuItem key={`d-${d.id}`} value={d.id}>
                  {d.nome}
                </MenuItem>
              ))}

              <MenuItem
                value={NEW_OPTION_VALUE}
                sx={{ fontWeight: "bold", borderTop: "1px solid #eee" }}
              >
                + Nova Disciplina
              </MenuItem>
            </Select>
          </FormControl>

          {selectedDiscipline === NEW_OPTION_VALUE && (
            <TextField
              label="Nome da Nova Disciplina"
              value={formData.nomeDisciplina}
              onChange={(e) =>
                handleNewNameChange("nomeDisciplina", e.target.value)
              }
              fullWidth
              required
              sx={{ mt: -1 }}
            />
          )}

          {/* TURMA */}
          <Typography variant="subtitle2" sx={{ color: "gray", mt: 1 }}>
            Turma *
          </Typography>

          <FormControl fullWidth required>
            <InputLabel id="turma-select-label">
              Selecione ou adicione uma Turma
            </InputLabel>

            <Select
              labelId="turma-select-label"
              value={selectedTurma}
              label="Selecione ou adicione uma Turma"
              onChange={handleTurmaSelectChange}
            >
              <MenuItem value={"" as SelectCustomValue} disabled>
                <em>Selecione uma opção</em>
              </MenuItem>

              {existingTurmas.map((t) => (
                <MenuItem key={`t-${t.id}`} value={t.id}>
                  {t.nome}
                </MenuItem>
              ))}

              <MenuItem
                value={NEW_OPTION_VALUE}
                sx={{ fontWeight: "bold", borderTop: "1px solid #eee" }}
              >
                + Nova Turma
              </MenuItem>
            </Select>
          </FormControl>

          {selectedTurma === NEW_OPTION_VALUE && (
            <TextField
              label="Nome da Nova Turma (Ex: 1º Ano A, EJA B)"
              value={formData.nomeTurma}
              onChange={(e) => handleNewNameChange("nomeTurma", e.target.value)}
              fullWidth
              required
              sx={{ mt: -1 }}
            />
          )}

          {/* TURNO */}
          <Typography variant="subtitle2" sx={{ color: "gray", mt: 1 }}>
            Turno *
          </Typography>

          <FormControl fullWidth required>
            <InputLabel id="turno-label">Turno *</InputLabel>

            <Select
              labelId="turno-label"
              value={formData.turno}
              label="Turno *"
              onChange={handleTurnoChange}
            >
              {availableTurnos.map((turno) => (
                <MenuItem key={turno} value={turno}>
                  {turno}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          color="secondary"
          disabled={loading || !isFormValid}
        >
          {loading ? <CircularProgress size={24} /> : "Adicionar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
