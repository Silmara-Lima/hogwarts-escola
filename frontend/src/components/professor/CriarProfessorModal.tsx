import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";

import type { SelectChangeEvent } from "@mui/material";
import type {
  CreateProfessorData,
  PublicProfessor,
} from "../../types/Professor";

import * as professorService from "../../services/ProfessorService";
import type { DisciplinaTurmaVinculo } from "../../services/ProfessorService";

// ===============================================================
// CONSTANTES
// ===============================================================

const TURMA_PADRAO_ID = 1;

interface DisciplinaItem {
  id: number;
  nome: string;
}

const DISCIPLINAS: DisciplinaItem[] = [
  { id: 1, nome: "Poções I" },
  { id: 2, nome: "Feitiços I" },
  { id: 3, nome: "Transfiguração II" },
  { id: 4, nome: "Adivinhação" },
  { id: 5, nome: "Estudos dos Trouxas" },
  { id: 6, nome: "Defesa Contra as Artes das Trevas" },
];

const DEPARTAMENTOS = [
  "Poções",
  "Transfiguração",
  "Feitiços",
  "Adivinhação",
  "Defesa Contra as Artes das Trevas",
  "Estudos dos Trouxas",
];

// ===============================================================
// PROPS DO MODAL
// ===============================================================
interface CriarProfessorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ===============================================================
// COMPONENTE
// ===============================================================
export const CriarProfessorModal = ({
  open,
  onClose,
  onSuccess,
}: CriarProfessorModalProps) => {
  const [formData, setFormData] = useState<
    CreateProfessorData & { disciplinasIds: number[] }
  >({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    departamento: "",
    matricula: "",
    senha: "",
    disciplinasIds: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFormData({
        nome: "",
        cpf: "",
        email: "",
        telefone: "",
        departamento: "",
        matricula: "",
        senha: "",
        disciplinasIds: [],
      });
      setError(null);
    }
  }, [open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent
  ) => {
    const name = e.target.name;
    const value = e.target.value;

    if (!name) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const { disciplinasIds, ...professorData } = formData;

    const required = [
      "nome",
      "cpf",
      "email",
      "matricula",
      "departamento",
      "senha",
      "telefone",
    ] as Array<keyof CreateProfessorData>;

    const missingRequired = required.some(
      (field) => !professorData[field] || professorData[field] === ""
    );

    if (missingRequired) {
      setError("Preencha todos os campos obrigatórios.");
      setLoading(false);
      return;
    }

    if (professorData.senha.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const novoProfessor: PublicProfessor =
        await professorService.createProfessor(professorData);

      if (disciplinasIds.length > 0) {
        const vinculosParaEnviar: DisciplinaTurmaVinculo[] = disciplinasIds.map(
          (discId) => ({
            disciplinaId: discId,
            turmaId: TURMA_PADRAO_ID,
          })
        );

        await professorService.vincularDisciplinas(
          novoProfessor.id,
          vinculosParaEnviar
        );
      }

      onClose();
      onSuccess();
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Erro inesperado ao criar professor.";

      const prettyMessage = message.includes("já existe")
        ? "Email, CPF ou Matrícula já estão em uso."
        : message;

      setError(prettyMessage);
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    !!formData.nome &&
    !!formData.cpf &&
    !!formData.email &&
    !!formData.matricula &&
    !!formData.departamento &&
    !!formData.telefone &&
    formData.senha.length >= 6;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="text-blue-700">
        Criar Novo Professor 🧙‍♂️
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Nome Completo"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label="Matrícula"
              name="matricula"
              value={formData.matricula}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={loading}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="CPF"
              name="cpf"
              value={formData.cpf}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={loading}
            />

            <TextField
              label="Telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={loading}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label="Senha"
              name="senha"
              type="password"
              value={formData.senha}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={loading}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth required disabled={loading}>
              <InputLabel id="departamento-label">Departamento</InputLabel>
              <Select
                labelId="departamento-label"
                name="departamento"
                value={formData.departamento}
                onChange={handleInputChange}
                label="Departamento"
              >
                <MenuItem value="">
                  <em>Selecione</em>
                </MenuItem>

                {DEPARTAMENTOS.map((dep) => (
                  <MenuItem key={dep} value={dep}>
                    {dep}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={loading}>
              <InputLabel id="disciplinas-label">
                Disciplinas Ministradas
              </InputLabel>
              <Select
                labelId="disciplinas-label"
                multiple
                value={formData.disciplinasIds}
                onChange={handleDisciplinasChange}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {DISCIPLINAS.filter((d) => selected.includes(d.id)).map(
                      (d) => (
                        <Chip key={d.id} label={d.nome} />
                      )
                    )}
                  </Box>
                )}
                label="Disciplinas Ministradas"
              >
                {DISCIPLINAS.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!isValid || loading}
        >
          {loading ? <CircularProgress size={24} /> : "Criar Professor"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
