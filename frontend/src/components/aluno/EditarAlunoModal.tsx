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
} from "@mui/material";
import { ZodError, z } from "zod";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/pt-br";

// ==============================================
// 🎯 DEFINIÇÕES DE TIPOS E SCHEMA
// ==============================================

const turnos = z.enum(["MATUTINO", "VESPERTINO", "NOTURNO"]);
type Turno = z.infer<typeof turnos>;

const updateAlunoSchema = z
  .object({
    nome: z.string().min(3).optional(),
    matricula: z.string().length(8).optional(),
    email: z.string().email().optional(),
    dataNascimento: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/) // Espera YYYY-MM-DD
      .nullable()
      .optional(),
    cpf: z.string().max(14).nullable().optional(),
    telefone: z.string().max(15).nullable().optional(),
    casaId: z.number().int().positive().nullable().optional(),
    turno: turnos.optional(),
    turmaId: z.number().int().positive().optional(),
  })
  .partial();

type UpdateAlunoData = z.infer<typeof updateAlunoSchema>;

type Casa = { id: number; nome: string };
type Turma = { id: number; serie: string; turno: Turno; ano: number };

export interface AlunoPropType {
  id: number;
  nome: string;
  matricula: string;
  email: string;
  dataNascimento: string; // Vindo do Backend (YYYY-MM-DD)
  turno: Turno | null | string;
  cpf: string | null | undefined;
  telefone: string | null | undefined;
  casaId: number | null | string | undefined;
  casa: { id: number | null | string; nome: string } | null;
  turmaId: number | null | string | undefined;
  turma: {
    id: number | string;
    serie: string;
    turno: Turno;
    ano: number;
  } | null;
}

// ==============================================
// MOCK DE SERVIÇO DE ATUALIZAÇÃO
// ==============================================

const updateAluno = (id: number, data: UpdateAlunoData) => {
  // Use 'data' diretamente!
  console.log(`MOCK API: Atualizando Aluno ${id}`, data);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Retorna o objeto completo para simular o sucesso
      if (Math.random() > 0.1) resolve({ id, ...data, isMock: true });
      else reject(new Error("Erro simulado do servidor"));
    }, 800);
  });
};

// ==============================================
// TIPOS DO FORMULÁRIO
// ==============================================

interface FormDataType {
  nome: string;
  matricula: string;
  email: string;
  turno: Turno | "";
  casaId: number | "";
  turmaId: number | "";
  dataNascimento: Dayjs | null; // 💡 Dayjs para o DatePicker
  telefone: string;
  cpf: string;
}

const initialEmptyState: FormDataType = {
  nome: "",
  matricula: "",
  email: "",
  turno: "",
  casaId: "",
  turmaId: "",
  dataNascimento: null,
  telefone: "",
  cpf: "",
};

// ==============================================
// COMPONENTE
// ==============================================

interface EditarAlunoModalProps {
  open: boolean;
  onClose: () => void;
  aluno: AlunoPropType | null;
  onSave: (atualizado: any) => void;
}

export const EditarAlunoModal = ({
  open,
  onClose,
  aluno,
  onSave,
}: EditarAlunoModalProps) => {
  const [formData, setFormData] = useState<FormDataType>(initialEmptyState);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [casas, setCasas] = useState<Casa[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      // ⚠️ Substitua por chamadas de API reais
      setCasas([
        { id: 1, nome: "Grifinória" },
        { id: 2, nome: "Sonserina" },
        { id: 3, nome: "Lufa-Lufa" },
        { id: 4, nome: "Corvinal" },
      ]);
      setTurmas([
        { id: 1, serie: "1º Ano", turno: "MATUTINO" as Turno, ano: 2025 },
        { id: 2, serie: "2º Ano", turno: "MATUTINO" as Turno, ano: 2025 },
        { id: 3, serie: "3º Ano", turno: "VESPERTINO" as Turno, ano: 2025 },
        { id: 4, serie: "4º Ano", turno: "VESPERTINO" as Turno, ano: 2025 },
      ]);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!open || !aluno) {
      setFormData(initialEmptyState);
      setErrors({});
      setTouched({});
      return;
    }
    const cpfValue = aluno.cpf ?? "";
    const telefoneValue = aluno.telefone ?? "";
    const casaIdValue = aluno.casaId ? Number(aluno.casaId) : "";
    const turmaIdValue = aluno.turmaId ? Number(aluno.turmaId) : "";
    const turnoValue = aluno.turno ?? "";

    // 💡 Ajuste de inicialização: Verifica se a string não está vazia.
    const dataNascimentoValue =
      aluno.dataNascimento && aluno.dataNascimento.length > 0
        ? dayjs(aluno.dataNascimento)
        : null;

    setFormData({
      nome: aluno.nome ?? "",
      matricula: aluno.matricula ?? "",
      email: aluno.email ?? "",
      cpf: cpfValue,
      telefone: telefoneValue,
      casaId: casaIdValue,
      turmaId: turmaIdValue,
      turno: turnoValue as Turno | "",
      dataNascimento: dataNascimentoValue,
    });

    loadData();
  }, [open, aluno]);

  const handleInputChange = (
    field: keyof FormDataType,
    value: string | number | Dayjs | null
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

    // Dispara a validação no change para data, ajudando na estabilidade
    if (touched[field as keyof UpdateAlunoData] || field === "dataNascimento")
      handleBlur(field as keyof UpdateAlunoData);
  };

  const handleBlur = (field: keyof UpdateAlunoData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    try {
      let valueToValidate: any = formData[field as keyof FormDataType];

      if (field === "dataNascimento") {
        // 💡 CORREÇÃO: Checa se o objeto Dayjs é válido.
        if (dayjs.isDayjs(valueToValidate) && valueToValidate.isValid()) {
          // Se for Dayjs VÁLIDO, formata para a string YYYY-MM-DD que o Zod espera
          valueToValidate = valueToValidate.format("YYYY-MM-DD");
        } else if (valueToValidate === null || valueToValidate === "") {
          // Se for NULO ou VAZIO, trata como undefined (opcional)
          valueToValidate = undefined;
        } else {
          // Se for um objeto Dayjs INVÁLIDO (ocorre ao digitar incorretamente)
          // Força uma string que falhará no regex Zod, mas garantindo que o Zod pegue o erro.
          valueToValidate = "DATA_INVALIDA_PARA_FORMATO";
        }
      }

      if (field === "telefone" || field === "cpf" || field === "casaId")
        valueToValidate = valueToValidate === "" ? null : valueToValidate;
      else if (field === "turno" || field === "turmaId")
        valueToValidate = valueToValidate === "" ? undefined : valueToValidate;

      updateAlunoSchema
        .pick({ [field]: true })
        .parse({ [field]: valueToValidate });

      setErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (err) {
      if (err instanceof ZodError)
        setErrors((prev) => ({ ...prev, [field]: err.issues[0].message }));
      else console.error(err);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    // 1. CONVERSÃO: Converte o valor Dayjs atual para a string YYYY-MM-DD ou null.
    // Usamos 'null' para representar a ausência/limpeza do campo.
    const novoDataNascimento =
      formData.dataNascimento && formData.dataNascimento.isValid()
        ? formData.dataNascimento.format("YYYY-MM-DD")
        : null;

    // 2. VALOR ORIGINAL: Obtém o valor original do aluno no mesmo formato (string ou null/vazio).
    // O aluno!.dataNascimento é a string YYYY-MM-DD que veio do backend.
    const originalDataNascimento = aluno!.dataNascimento || null;

    // 3. CONSTRUÇÃO DO rawPayload (Sem dataNascimento inicialmente)
    const rawPayload: UpdateAlunoData = {
      nome: formData.nome || undefined,
      matricula: formData.matricula || undefined,
      email: formData.email || undefined,

      // Campos que aceitam null no backend, mas são string/number no formulário
      telefone: formData.telefone === "" ? null : formData.telefone,
      cpf: formData.cpf === "" ? null : formData.cpf,
      casaId: formData.casaId === "" ? null : Number(formData.casaId),

      // Campos que são undefined se vazios
      turno: formData.turno === "" ? undefined : (formData.turno as Turno),
      turmaId: formData.turmaId === "" ? undefined : Number(formData.turmaId),
    };

    // 4. LÓGICA DE DETECÇÃO DE MUDANÇA PARA dataNascimento
    // Se o valor novo for diferente do valor original (mudança ou remoção), inclui no payload.
    if (novoDataNascimento !== originalDataNascimento) {
      // Se mudou, enviamos o novo valor (YYYY-MM-DD ou null para apagar).
      rawPayload.dataNascimento = novoDataNascimento;
    }

    // 5. FILTRAGEM: Remove todos os campos que são 'undefined' (que não foram alterados).
    const payload = Object.fromEntries(
      Object.entries(rawPayload).filter(([, v]) => v !== undefined)
    ) as UpdateAlunoData;

    // 🔴 DEBUG: Verifique se a data está aqui SE tiver sido alterada!
    console.log(
      "PAYLOAD FINAL ENVIADO PARA API (EDIT):",
      JSON.stringify(payload, null, 2)
    );

    // 6. VERIFICAÇÃO FINAL: Se o payload está vazio, não há nada para salvar.
    if (Object.keys(payload).length === 0) {
      setErrors({ geral: "Nenhuma alteração detectada para salvar." });
      setLoading(false);
      return;
    }

    try {
      // 7. Validação Zod
      // O Zod valida apenas os campos presentes no payload (que são os alterados)
      updateAlunoSchema.parse(payload);

      // 8. Chamar o Serviço
      const atualizado = await updateAluno(aluno!.id, payload);
      onSave(atualizado);
      onClose();
    } catch (err) {
      // Tratamento de erros
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          fieldErrors[issue.path[0] as string] = issue.message;
        });
        setErrors(fieldErrors);
      } else {
        console.error(err);
        setErrors({
          geral: "Erro ao salvar: Verifique os dados e tente novamente.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!aluno) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Aluno: {aluno.nome}</DialogTitle>
        <DialogContent>
          {loadingData ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              {errors.geral && (
                <Box
                  sx={{
                    color: "error.main",
                    textAlign: "center",
                    p: 1,
                    border: 1,
                    borderColor: "error.main",
                    borderRadius: 1,
                  }}
                >
                  {errors.geral}
                </Box>
              )}
              {/* Nome e Email */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  onBlur={() => handleBlur("nome")}
                  error={!!errors.nome}
                  helperText={errors.nome}
                  fullWidth
                  disabled={loading}
                />
                <TextField
                  label="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  error={!!errors.email}
                  helperText={errors.email}
                  fullWidth
                  disabled={loading}
                />
              </Box>
              {/* Matrícula e Data de Nascimento */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Matrícula"
                  value={formData.matricula}
                  onChange={(e) =>
                    handleInputChange("matricula", e.target.value)
                  }
                  onBlur={() => handleBlur("matricula")}
                  error={!!errors.matricula}
                  helperText={errors.matricula}
                  fullWidth
                  disabled={loading}
                />
                {/* DataPicker */}
                <DatePicker
                  label="Nascimento"
                  format="DD/MM/YYYY"
                  value={formData.dataNascimento}
                  onChange={(newValue) =>
                    handleInputChange("dataNascimento", newValue)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.dataNascimento,
                      helperText: errors.dataNascimento || "Ex: 31/12/2000",
                      onBlur: () => handleBlur("dataNascimento"),
                      disabled: loading,
                    },
                  }}
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
                  onChange={(e) =>
                    handleInputChange("telefone", e.target.value)
                  }
                  onBlur={() => handleBlur("telefone")}
                  error={!!errors.telefone}
                  helperText={errors.telefone}
                  fullWidth
                  disabled={loading}
                />
              </Box>

              {/* Turno, Casa e Turma */}
              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Turno */}
                <TextField
                  select
                  label="Turno"
                  value={formData.turno}
                  onChange={(e) => handleInputChange("turno", e.target.value)}
                  onBlur={() => handleBlur("turno")}
                  error={!!errors.turno}
                  helperText={errors.turno}
                  fullWidth
                  disabled={loading}
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

                {/* Casa */}
                <TextField
                  select
                  label="Casa"
                  value={formData.casaId}
                  onChange={(e) => handleInputChange("casaId", e.target.value)}
                  onBlur={() => handleBlur("casaId")}
                  error={!!errors.casaId}
                  helperText={errors.casaId}
                  fullWidth
                  disabled={loading}
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

                {/* Turma */}
                <TextField
                  select
                  label="Turma"
                  value={formData.turmaId}
                  onChange={(e) => handleInputChange("turmaId", e.target.value)}
                  onBlur={() => handleBlur("turmaId")}
                  error={!!errors.turmaId}
                  helperText={errors.turmaId}
                  fullWidth
                  disabled={loading}
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
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} variant="contained">
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};
