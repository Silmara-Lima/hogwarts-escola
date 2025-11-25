// =========================================================================
// ProfessoresTable
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
import type { ProfessorDetalhe } from "../../types/Professor";

interface ProfessoresTableProps {
  professores: ProfessorDetalhe[];
  deletingId: number | null;
  onDelete: (id: number) => void;
  onEdit: (professor: ProfessorDetalhe) => void;
  loading: boolean;
}

export const ProfessoresTable = ({
  professores,
  deletingId,
  onDelete,
  onEdit,
  loading,
}: ProfessoresTableProps) => {
  const colunas: string[] = [
    "Nome",
    "Matrícula",
    "Email",
    "Telefone",
    "Departamento",
    "Ações",
  ];

  const colSpan = colunas.length;

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
      <Table size="small">
        <TableHead>
          <TableRow className="bg-gray-800">
            {colunas.map((coluna) => (
              <TableCell
                key={coluna}
                align="center"
                className="font-bold text-white"
                sx={{ py: 1.5 }}
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
                colSpan={colSpan}
                align="center"
                className="py-6 text-gray-500"
              >
                Nenhum professor encontrado. 😔
              </TableCell>
            </TableRow>
          ) : (
            professores.map((professor) => {
              const isDeleting = deletingId === professor.id;

              return (
                <TableRow key={professor.id} hover className="hover:bg-blue-50">
                  <TableCell align="center">{professor.nome}</TableCell>
                  <TableCell align="center">{professor.matricula}</TableCell>
                  <TableCell
                    align="center"
                    className="text-sm max-w-xs truncate"
                  >
                    {professor.email}
                  </TableCell>
                  <TableCell align="center">
                    {professor.telefone || "-"}
                  </TableCell>
                  <TableCell align="center">
                    {professor.departamento || "-"}
                  </TableCell>

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
                            <CircularProgress size={20} color="inherit" />
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
