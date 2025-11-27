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
  FormHelperText,
  Alert,
  type SelectChangeEvent,
} from "@mui/material";
import { ZodError } from "zod";

// Importe seus schemas e tipos
import { createAlunoSchema } from "../../schemas/AlunoSchema";
import type { CreateAlunoData } from "../../types/Alunos";
import type { Turma, Casa } from "../../types/CasaeTurma";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

// ⚠️ Se você está usando o código do Service logo acima, troque as funções simuladas
// pelo import real, por exemplo:
// import { getTurmas, getCasas } from "../../services/alunosService";

// ==============================================
// 1. TIPAGEM PARA O ESTADO DO FORMULÁRIO
// ==============================================
interface AlunoFormDataType {
  nome: string;
  email: string;
  senha: string;
  matricula: string;
  cpf: string;
  telefone: string;
  curso?: string;
  dataNascimento: Dayjs | null; // DD/MM/YYYY com máscara
  turmaId: number | null;
  casaId: number | null;
  turno: "MATUTINO" | "VESPERTINO" | "NOTURNO" | "";
}

const initialFormData: AlunoFormDataType = {
  nome: "",
  email: "",
  senha: "",
  matricula: "",
  cpf: "",
  telefone: "",
  curso: "",
  dataNascimento: null, // DD/MM/YYYY
  turmaId: null,
  casaId: null,
  turno: "",
};

// ==============================================
// 2. PROPS DO MODAL
// ==============================================
interface CriarAlunoModalProps {
  open: boolean;
  onClose: () => void; // A prop onSave agora tem uma tipagem mais precisa (o retorno é um Promise<void> ou um Error)
  onSave: (dados: CreateAlunoData) => Promise<void>;
  onSuccess: () => void;
}

// ==============================================
// 3. UTILS SIMULADOS E FUNÇÕES DE DATA (COM MÁSCARA)
// ⚠️ Estes MOCKs devem ser substituídos pelos imports reais do Service
// ==============================================
const CURSOS_SIMULADOS_MOCK: Turma["curso"][] = [
  { id: 1, nome: "Poções" },
  { id: 2, nome: "Transfiguração" },
];

const TURMAS_SIMULADAS: Turma[] = [
  {
    id: 1,
    serie: "1º Ano",
    ano: 2025,
    turno: "MATUTINO",
    curso: CURSOS_SIMULADOS_MOCK[0] as unknown as Turma["curso"],
  },
  {
    id: 2,
    serie: "2º Ano",
    ano: 2024,
    turno: "NOTURNO",
    curso: CURSOS_SIMULADOS_MOCK[1] as unknown as Turma["curso"],
  },
];

const CASAS_SIMULADAS: Casa[] = [
  { id: 1, nome: "Grifinória" },
  { id: 2, nome: "Sonserina" },
  { id: 3, nome: "Corvinal" },
  { id: 4, nome: "Lufa-Lufa" },
];

// ⚠️ Mantenha estas funções SIMULADAS ou COLOQUE O IMPORT REAL do Service
const getTurmasSimulado = async (): Promise<Turma[]> => TURMAS_SIMULADAS;
const getCasasSimulado = async (): Promise<Casa[]> => CASAS_SIMULADAS;

/**
 * Aplica a máscara DD/MM/AAAA conforme o usuário digita.
 */

/*
const maskDate = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};*/

/**
 * Converte data DD/MM/AAAA para YYYY-MM-DD.
 */
/*
const convertBrazilToISO = (dateString: string): string | undefined => {
  if (!dateString || dateString.length === 0) return undefined;

  const digitsOnly = dateString.replace(/\D/g, "");

  if (digitsOnly.length !== 8) return undefined; // Incompleta

  const day = Number(digitsOnly.slice(0, 2));
  const month = Number(digitsOnly.slice(2, 4));
  const year = Number(digitsOnly.slice(4, 8)); // Validação básica de data (evita datas impossíveis como 31/02)

  const dateObj = new Date(year, month - 1, day);
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    return undefined; // Data inválida
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
};
*/

// ==============================================
// 4. COMPONENTE PRINCIPAL
// ==============================================
export const CriarAlunoModal: React.FC<CriarAlunoModalProps> = ({
  open,
  onClose,
  onSave,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<AlunoFormDataType>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [casas, setCasas] = useState<Casa[]>([]);

  useEffect(() => {
    if (open) {
      setFormData(initialFormData);
      setErrors({});
      const loadData = async () => {
        try {
          // ⚠️ Trocar para getTurmas() e getCasas() reais na sua aplicação
          const [turmaData, casaData] = await Promise.all([
            getTurmasSimulado(),
            getCasasSimulado(),
          ]);
          setTurmas(turmaData);
          setCasas(casaData);
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
          setErrors((prev) => ({
            ...prev,
            geral: "Falha ao carregar turmas ou casas.",
          }));
        }
      };
      loadData();
    }
  }, [open]); // ============================================== // HANDLERS // ==============================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let finalValue = value;

    //if (name === "dataNascimento") {
    //  finalValue = maskDate(value);
    //}

    setFormData((prev: AlunoFormDataType) => ({ ...prev, [name]: finalValue }));
    setErrors((prev) => ({ ...prev, [name]: undefined, geral: undefined }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;

    let typedValue: string | number | null;

    if (name === "turmaId" || name === "casaId") {
      // Converte a string de volta para number, ou null se for "".
      // O `handleInputChange` envia `null` para o estado, que é necessário no `Select`
      // para mostrar o item "Selecione..." quando o valor é "".
      typedValue = value === "" || value === null ? null : Number(value);
    } else {
      typedValue = value;
    }

    setFormData((prev: AlunoFormDataType) => ({
      ...prev,
      [name as keyof AlunoFormDataType]: typedValue,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined, geral: undefined }));
  };

  const handleModalClose = () => {
    if (!loading) {
      setFormData(initialFormData);
      setErrors({});
      onClose();
    }
  };
  // ==============================================
  // SUBMISSÃO (Fluxo de validação de dados) - CORRIGIDO
  // ==============================================
  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    const rawData = { ...formData };
    let dataToSend: string | undefined = undefined; // YYYY-MM-DD ou undefined

    // 1. Converte a data do Dayjs para YYYY-MM-DD
    if (rawData.dataNascimento && rawData.dataNascimento.isValid()) {
      dataToSend = rawData.dataNascimento.format("YYYY-MM-DD");
    }
    // Se for nula, undefined ou inválida, 'dataToSend' permanece undefined,
    // e o Zod irá capturar a obrigatoriedade.

    // 2. Prepara o objeto FINAL (payload)
    const payload: CreateAlunoData = {
      nome: rawData.nome,
      email: rawData.email,
      senha: rawData.senha,
      matricula: rawData.matricula,
      cpf: rawData.cpf,
      telefone: rawData.telefone,

      // 🔴 CAMPO CRÍTICO: Incluímos dataNascimento AQUI
      dataNascimento: dataToSend,

      // Converte null/vazio para undefined para Zod, mas garante a tipagem
      turmaId: rawData.turmaId === null ? undefined : rawData.turmaId,
      turno:
        rawData.turno === ""
          ? undefined
          : (rawData.turno as CreateAlunoData["turno"]),
      casaId: rawData.casaId === null ? undefined : rawData.casaId,
    } as CreateAlunoData;

    // 🔴 DEBUG: Garante que a data está no objeto ANTES do Zod
    console.log(
      "PAYLOAD ANTES DO ZOD (FRONTEND):",
      JSON.stringify(payload, null, 2)
    );

    try {
      // 3. Validação Zod
      createAlunoSchema.parse(payload);

      console.log("PAYLOAD VALIDADO PELO ZOD: OK");

      // 4. Chamar o Serviço (O onSave utiliza o objeto 'payload' validado)
      await onSave(payload);
      // ⚠️ Se a data sumir, a remoção está ocorrendo DENTRO da função 'onSave'

      // 5. Sucesso
      onClose();
      onSuccess();
    } catch (err) {
      // Tratamento de erros Zod e de API
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          const key = issue.path[0] as string;
          fieldErrors[key] = issue.message;
        });
        setErrors(fieldErrors);
      } else if (err instanceof Error) {
        setErrors({ geral: err.message });
      } else {
        setErrors({ geral: "Erro desconhecido ao tentar criar o aluno." });
      }
    } finally {
      setLoading(false);
    }
  }; // ============================================== // RENDERIZAÇÃO COMPLETA // ==============================================

  return (
    <Dialog open={open} onClose={handleModalClose} maxWidth="sm" fullWidth>
           {" "}
      <DialogTitle sx={{ color: "primary.main", fontWeight: 600 }}>
                Novo Aluno 🧙‍♂️      {" "}
      </DialogTitle>
           {" "}
      <DialogContent>
               {" "}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                   {" "}
          {errors.geral && <Alert severity="error">{errors.geral}</Alert>}     
              {/* Nome e Matrícula */}         {" "}
          <Box sx={{ display: "flex", gap: 2 }}>
                       {" "}
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
                       {" "}
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
                     {" "}
          </Box>
                    {/* CPF e Telefone */}         {" "}
          <Box sx={{ display: "flex", gap: 2 }}>
                       {" "}
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
                       {" "}
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
                     {" "}
          </Box>
                    {/* Email e Senha */}         {" "}
          <Box sx={{ display: "flex", gap: 2 }}>
                       {" "}
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
                       {" "}
            <TextField
              name="senha"
              label="Senha Inicial"
              type="password"
              value={formData.senha}
              onChange={handleInputChange}
              error={!!errors.senha}
              helperText={errors.senha || "Mínimo 6 caracteres."}
              fullWidth
              required
              disabled={loading}
            />
                     {" "}
          </Box>
                    {/* Curso e Data de Nascimento - CAMPO CRÍTICO */}         {" "}
          <Box sx={{ display: "flex", gap: 2 }}>
                       {" "}
            <TextField
              name="curso"
              label="Curso"
              value={formData.curso}
              onChange={handleInputChange}
              error={!!errors.curso}
              helperText={errors.curso || "Apenas para seleção de Turma."}
              fullWidth
              required
              disabled={loading}
            />
                       {" "}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Nascimento"
                value={formData.dataNascimento}
                onChange={(newValue) =>
                  setFormData((prev) => ({ ...prev, dataNascimento: newValue }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.dataNascimento,
                    helperText: errors.dataNascimento || "Ex: 31/12/2000",
                    disabled: loading,
                  },
                }}
                format="DD/MM/YYYY"
              />
            </LocalizationProvider>
                     {" "}
          </Box>
                    {/* Turma, Turno e Casa */}         {" "}
          <Box sx={{ display: "flex", gap: 2 }}>
                        {/* Turma */}           {" "}
            <FormControl
              fullWidth
              required
              disabled={loading}
              error={!!errors.turmaId}
            >
                            <InputLabel id="turma-label">Turma</InputLabel>     
                     {" "}
              <Select
                labelId="turma-label"
                name="turmaId"
                value={formData.turmaId === null ? "" : formData.turmaId}
                onChange={handleSelectChange}
                label="Turma"
              >
                               {" "}
                <MenuItem value="">
                                    <em>Selecione a Turma</em>               {" "}
                </MenuItem>
                               {" "}
                {turmas.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                                        {t.serie} - {t.turno}                 {" "}
                  </MenuItem>
                ))}
                             {" "}
              </Select>
                           {" "}
              <FormHelperText>{errors.turmaId || " "}</FormHelperText>         
               {" "}
            </FormControl>
                        {/* Turno */}           {" "}
            <FormControl
              fullWidth
              required
              disabled={loading}
              error={!!errors.turno}
            >
                            <InputLabel id="turno-label">Turno</InputLabel>     
                     {" "}
              <Select
                labelId="turno-label"
                name="turno"
                value={formData.turno}
                onChange={handleSelectChange}
                label="Turno"
              >
                               {" "}
                <MenuItem value="">
                                    <em>Selecione o Turno</em>               {" "}
                </MenuItem>
                                <MenuItem value="MATUTINO">Matutino</MenuItem> 
                              <MenuItem value="VESPERTINO">Vespertino</MenuItem>
                                <MenuItem value="NOTURNO">Noturno</MenuItem>   
                         {" "}
              </Select>
                           {" "}
              <FormHelperText>{errors.turno || " "}</FormHelperText>           {" "}
            </FormControl>
                        {/* Casa (Opcional) */}           {" "}
            <FormControl fullWidth disabled={loading} error={!!errors.casaId}>
                            <InputLabel id="casa-label">Casa</InputLabel>       
                   {" "}
              <Select
                labelId="casa-label"
                name="casaId"
                value={formData.casaId === null ? "" : formData.casaId}
                onChange={handleSelectChange}
                label="Casa"
              >
                               {" "}
                <MenuItem value="">
                                    <em>Nenhuma</em>               {" "}
                </MenuItem>
                               {" "}
                {casas.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                                        {c.nome}                 {" "}
                  </MenuItem>
                ))}
                             {" "}
              </Select>
                           {" "}
              <FormHelperText>{errors.casaId || " "}</FormHelperText>           {" "}
            </FormControl>
                     {" "}
          </Box>
                 {" "}
        </Box>
             {" "}
      </DialogContent>
           {" "}
      <DialogActions sx={{ p: 2 }}>
               {" "}
        <Button onClick={handleModalClose} disabled={loading}>
                    Cancelar        {" "}
        </Button>
               {" "}
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !!errors.geral}
        >
                   {" "}
          {loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            "Criar Aluno"
          )}
                 {" "}
        </Button>
             {" "}
      </DialogActions>
         {" "}
    </Dialog>
  );
};
