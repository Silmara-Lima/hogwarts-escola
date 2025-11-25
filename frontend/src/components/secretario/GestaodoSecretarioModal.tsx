// =========================================================================
// 1. ProfessoresTable (Tabela de Professores)
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

// =========================================================================
// Tipos Auxiliares
// =========================================================================
interface LookUpItem {
  id: number;
  nome: string;
}

interface Professor {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  casaId?: number;
  turmaId?: number;
}

interface ProfessoresTableProps {
  professores: Professor[];
  deletingId: number | null;
  onDelete: (id: number) => void;
  onEdit: (professor: Professor) => void;
  loading: boolean;
  casas: LookUpItem[];
  professorTurmas: LookUpItem[];
}

// =========================================================================
// Componente
// =========================================================================
export const ProfessoresTable = ({
  professores,
  deletingId,
  onDelete,
  onEdit,
  loading,
  casas,
  professorTurmas,
}: ProfessoresTableProps) => {
  // =========================================================================
  // Função para obter nome do item por ID
  // =========================================================================
  const getItemName = (
    itemId: number | undefined,
    list: LookUpItem[]
  ): string => {
    if (itemId === undefined) return "-";
    const item = list.find((i) => i.id === itemId);
    return item?.nome || "-";
  };

  const colunas: string[] = [
    "Nome",
    "CPF",
    "Email",
    "Telefone",
    "Casa/Departamento",
    "Turma Principal",
    "Disciplina",
    "Horário",
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
    <TableContainer className="mt-4 rounded-lg shadow-md">
      <Table>
        <TableHead>
          <TableRow className="bg-gray-800">
            {colunas.map((coluna) => (
              <TableCell
                key={coluna}
                align="center"
                className="font-bold text-white"
                sx={{
                  textAlign:
                    coluna === "Nome" || coluna === "Email" ? "left" : "center",
                }}
              >
                {coluna}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {professores.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={colunas.length}
                align="center"
                className="py-6 text-gray-500"
              >
                Nenhum professor encontrado. 😔
              </TableCell>
            </TableRow>
          ) : (
            professores.map((professor) => {
              const isDeleting = deletingId === professor.id;
              const casaNome = getItemName(professor.casaId, casas);
              const turmaNome = getItemName(professor.turmaId, professorTurmas);

              return (
                <TableRow key={professor.id} hover className="hover:bg-blue-50">
                  <TableCell align="left" className="font-medium">
                    {professor.nome}
                  </TableCell>
                  <TableCell align="center">{professor.cpf}</TableCell>
                  <TableCell align="left">{professor.email}</TableCell>
                  <TableCell align="center">
                    {professor.telefone || "-"}
                  </TableCell>
                  <TableCell align="center">{casaNome}</TableCell>
                  <TableCell align="center">{turmaNome}</TableCell>
                  <TableCell align="center">-</TableCell>
                  <TableCell align="center">-</TableCell>
                  <TableCell align="center">
                    <div className="flex justify-center gap-2">
                      <Tooltip title="Editar">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => onEdit(professor)}
                          disabled={isDeleting}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remover">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => onDelete(professor.id)}
                          disabled={isDeleting}
                          aria-label={`remover-${professor.id}`}
                        >
                          {isDeleting ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <DeleteIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
