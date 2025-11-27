// ARQUIVO: ../components/aluno/ConsultarAlunoTable.tsx
// =========================================================================
// NORMALIZAÇÃO DE ALUNO
// =========================================================================
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import type { AlunoFrontEnd as Aluno } from "../../types/Alunos"; // Assumindo que você usa AlunoFrontEnd
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

interface AlunosTableProps {
  alunos: Aluno[]; // O array de alunos JÁ VEM FILTRADO do componente pai
  deletingId: number | null;
  onDelete: (id: number) => void;
  onEdit: (aluno: Aluno) => void;
  loading: boolean;
  searchQuery?: string; // Mantido, mas não usado para filtrar
}

// ⚠️ MANTIDO: Função para mapear/normalizar o objeto Aluno para garantir a exibição
const normalizarAluno = (raw: any): Aluno => {
  const origem = raw.aluno || raw.data || raw;
  return {
    id: origem.id,
    nome: origem.nome || origem.nomeCompleto || "Sem nome",
    matricula: origem.matricula ?? "",
    dataNascimento: origem.dataNascimento ?? null,
    cpf: origem.cpf || (origem.aluno?.cpf ?? origem.data?.cpf) || "N/A",
    telefone:
      origem.telefone ||
      (origem.aluno?.telefone ?? origem.data?.telefone) ||
      "N/A",
    email: origem.email ?? "",
    turno: origem.turno ?? "N/A",
    // Os objetos casa e turma já devem vir do AlunoFrontEnd no formato correto
    casa: origem.casa ? { id: origem.casa.id, nome: origem.casa.nome } : null,
    turma: origem.turma
      ? {
          id: origem.turma.id,
          serie: origem.turma.serie,
          turno: origem.turma.turno,
        }
      : null,
  };
};

// =========================================================================
// FORMATAR DATA CORRETAMENTE
// =========================================================================
const formatarDataCorreta = (dataStr: string | null | undefined) => {
  if (!dataStr || dataStr.trim() === "") return "N/A";

  // Se já veio no formato DD/MM/AAAA (vindo do mapAlunoFromBackend), retorna
  if (dataStr.includes("/")) return dataStr;

  // Se veio no formato ISO (YYYY-MM-DD), faz a conversão
  const parts = dataStr.split("-").map(Number);
  if (parts.length < 3) return "Data Inválida";

  // Usamos o construtor Date(ano, mês-1, dia) para evitar problemas de fuso
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  if (isNaN(date.getTime())) return "Data Inválida";

  return format(date, "dd/MM/yyyy", { locale: ptBR });
};

// =========================================================================
// COMPONENTE DA TABELA
// =========================================================================
export const AlunosTable = ({
  alunos, // JÁ FILTRADO
  deletingId,
  onDelete,
  onEdit,
  loading,
}: AlunosTableProps) => {
  // 🟢 CORREÇÃO: Usamos os alunos recebidos (que já foram filtrados no pai)
  // e apenas aplicamos a normalização.
  const alunosParaRenderizar = alunos.map(normalizarAluno);

  const colunas: string[] = [
    "Nome",
    "Matrícula",
    "Data de Nascimento",
    "Email",
    "Casa",
    "Ações",
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer className="mt-4 rounded-lg shadow-lg">
      <Table size="small">
        <TableHead>
          <TableRow className="bg-gray-800">
            {colunas.map((coluna) => (
              <TableCell
                key={coluna}
                align="center"
                className="font-bold text-white whitespace-nowrap"
                sx={{ py: 1.5 }}
              >
                {coluna}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {alunosParaRenderizar.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={colunas.length}
                align="center"
                className="py-6 text-gray-500"
              >
                ❌ Nenhum aluno encontrado.
              </TableCell>
            </TableRow>
          ) : (
            alunosParaRenderizar.map((aluno) => (
              <TableRow
                key={aluno.id}
                hover
                className="hover:bg-blue-50 transition-colors duration-150 even:bg-gray-50"
              >
                <TableCell align="left" className="font-medium text-gray-900">
                  {aluno.nome}
                </TableCell>

                <TableCell align="center" className="whitespace-nowrap">
                  {aluno.matricula || "N/A"}
                </TableCell>

                <TableCell align="center" className="whitespace-nowrap">
                  {aluno.dataNascimento
                    ? formatarDataCorreta(aluno.dataNascimento)
                    : "-"}
                </TableCell>

                <TableCell align="center" className="text-sm max-w-xs truncate">
                  {aluno.email || "N/A"}
                </TableCell>

                <TableCell
                  align="center"
                  className="font-semibold text-red-800 whitespace-nowrap"
                >
                  {aluno.casa?.nome || "N/A"}
                </TableCell>

                <TableCell align="center" className="whitespace-nowrap">
                  <div className="flex justify-center gap-1">
                    <Tooltip title="Editar">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => onEdit(aluno)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Remover">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => onDelete(aluno.id)}
                        disabled={deletingId === aluno.id}
                        aria-label={`remover-${aluno.id}`}
                      >
                        {deletingId === aluno.id ? (
                          <CircularProgress size={16} color="error" />
                        ) : (
                          <DeleteIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
