import React, { useState, useEffect, useCallback, useMemo } from "react";

// --- CONFIGURAÇÃO GLOBAL (IGNORAR NO CONTEXTO DO COMPONENTE) ---
const __app_id = "react-matricula-app";
const __firebase_config = "{}";
const __initial_auth_token = "mock-auth-token-123";

// --- TIPAGEM E MOCKS DE DADOS ---

// Tipagem para Aluno (ex-Paciente)
interface Aluno {
  id: number;
  nome: string;
  documento: string; // Ex: CPF, RG ou Matrícula
}

// Tipagem para Turma (ex-Medico)
interface Turma {
  id: number;
  nome: string;
  periodo: string; // Ex: Manhã, Tarde
  curso: string;
}

// Tipagem para os dados de Matrícula a serem salvos
interface MatriculaFormData {
  dataMatricula: string;
  observacoes: string;
  alunoId: number;
  turmaId: number;
}

// MOCK: Funções de serviço (Simulando o acesso ao backend)
const getAlunos = (): Promise<Aluno[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 101, nome: "Ana Silva", documento: "123.456.789-00" },
        { id: 102, nome: "Bruno Costa", documento: "987.654.321-11" },
        { id: 103, nome: "Carla Pires", documento: "111.222.333-44" },
      ]);
    }, 500);
  });
};

const getTurmas = (): Promise<Turma[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 201,
          nome: "TADS 2025/1",
          periodo: "Noturno",
          curso: "Análise e Desenvolvimento de Sistemas",
        },
        {
          id: 202,
          nome: "Enfermagem 1A",
          periodo: "Matutino",
          curso: "Enfermagem",
        },
        {
          id: 203,
          nome: "Marketing Digital 2A",
          periodo: "Vespertino",
          curso: "Marketing",
        },
      ]);
    }, 500);
  });
};

// --- CONTEÚDO DO matriculaSchema.ts (SIMULAÇÃO DE ARQUIVO EXTERNO) ---

// Zod Schema Mock
type FieldSchema = { required: boolean; min?: number; message?: string };

const MatriculaSchemaMock: Record<keyof MatriculaFormData, FieldSchema> = {
  alunoId: { required: true, min: 1, message: "O aluno deve ser selecionado." },
  turmaId: { required: true, min: 1, message: "A turma deve ser selecionada." },
  dataMatricula: {
    required: true,
    message: "A data da matrícula é obrigatória.",
  },
  observacoes: { required: false, message: "" },
};

/**
 * Função de validação de campo simulando Zod/Yup.
 * No ambiente real, essa função usaria `schema.safeParse(value)`.
 */
const validateField = (
  field: keyof MatriculaFormData,
  value: string | number
): string => {
  const schema = MatriculaSchemaMock[field];

  if (schema?.required && (value === 0 || value === "" || value === null)) {
    return schema.message || "";
  }
  if (typeof value === "number" && schema?.min && value < schema.min) {
    return schema.message || "";
  }

  return "";
};

// --- INTERFACE E COMPONENTE PRINCIPAL ---

interface MatricularAlunoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (dados: MatriculaFormData) => Promise<void>;
}

export const MatricularAlunoModal: React.FC<MatricularAlunoModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const initialState: MatriculaFormData = useMemo(
    () => ({
      dataMatricula: new Date().toISOString().substring(0, 10),
      observacoes: "",
      alunoId: 0,
      turmaId: 0,
    }),
    []
  );

  const [formData, setFormData] = useState<MatriculaFormData>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false); // Loading do Save
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loadingData, setLoadingData] = useState(false); // Loading dos dados

  // Efeito para carregar dados e resetar o formulário ao abrir o modal
  useEffect(() => {
    if (open) {
      setFormData(initialState);
      setErrors({});
      setTouched({});
      loadData();
    }
  }, [open, initialState]); // Dependência de initialState garante reset correto

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [alunosData, turmasData] = await Promise.all([
        getAlunos(),
        getTurmas(),
      ]);
      setAlunos(alunosData);
      setTurmas(turmasData);
    } catch (error) {
      console.error("Erro ao carregar dados de matrícula:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (
    field: keyof MatriculaFormData,
    value: string | number
  ) => {
    // Garante que os IDs sejam tratados como Number
    const finalValue =
      field === "alunoId" || field === "turmaId" ? Number(value) : value;

    setFormData((prev) => ({ ...prev, [field]: finalValue }));

    // Validação reativa após o primeiro toque
    if (touched[field]) {
      const error = validateField(field, finalValue);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof MatriculaFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = formData[field];
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};
    let isValid = true;

    // Força a validação e toque em todos os campos
    for (const key of Object.keys(formData) as Array<keyof MatriculaFormData>) {
      newTouched[key] = true;
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    }

    setTouched(newTouched);
    setErrors(newErrors);

    if (!isValid) {
      return;
    }

    setLoading(true);
    try {
      // Chama a função de salvamento externa (simulando a chamada de API)
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Erro ao matricular aluno:", error);
      // Aqui você poderia definir um erro de UI, se necessário
    } finally {
      setLoading(false);
    }
  };

  // Se o modal não estiver aberto, não renderiza nada
  if (!open) return null;

  // --- RENDERIZAÇÃO DO MODAL (ESTILIZADO COM TAILWIND) ---

  const inputClass = (isError: boolean) =>
    `w-full px-4 py-2 border rounded-lg transition duration-150 ${
      isError
        ? "border-red-500 ring-red-500"
        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
    } shadow-sm`;

  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const errorTextClass = "text-xs text-red-600 mt-1 h-4";
  const containerClass = "mb-4";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex justify-center items-center p-4 font-inter">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="bg-white rounded-xl shadow-3xl w-full max-w-lg overflow-hidden transform transition-all">
        {/* Header/Title */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            Matricular Aluno
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content/Form */}
        <div className="p-6">
          {loadingData ? (
            <div className="flex justify-center items-center h-48">
              <svg
                className="animate-spin h-8 w-8 text-indigo-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="ml-3 text-indigo-700">Carregando dados...</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              {/* Campo Aluno */}
              <div className={containerClass}>
                <label htmlFor="alunoId" className={labelClass}>
                  Aluno
                </label>
                <select
                  id="alunoId"
                  name="alunoId"
                  value={formData.alunoId}
                  onChange={(e) =>
                    handleInputChange("alunoId", Number(e.target.value))
                  }
                  onBlur={() => handleBlur("alunoId")}
                  className={inputClass(touched.alunoId && !!errors.alunoId)}
                >
                  <option value={0}>Selecione o aluno</option>
                  {alunos.map((aluno) => (
                    <option key={aluno.id} value={aluno.id}>
                      {aluno.nome} ({aluno.documento})
                    </option>
                  ))}
                </select>
                <p className={errorTextClass}>
                  {touched.alunoId && errors.alunoId}
                </p>
              </div>

              {/* Campo Turma */}
              <div className={containerClass}>
                <label htmlFor="turmaId" className={labelClass}>
                  Turma
                </label>
                <select
                  id="turmaId"
                  name="turmaId"
                  value={formData.turmaId}
                  onChange={(e) =>
                    handleInputChange("turmaId", Number(e.target.value))
                  }
                  onBlur={() => handleBlur("turmaId")}
                  className={inputClass(touched.turmaId && !!errors.turmaId)}
                >
                  <option value={0}>Selecione a turma</option>
                  {turmas.map((turma) => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome} - {turma.curso} ({turma.periodo})
                    </option>
                  ))}
                </select>
                <p className={errorTextClass}>
                  {touched.turmaId && errors.turmaId}
                </p>
              </div>

              {/* Campo Data de Matrícula */}
              <div className={containerClass}>
                <label htmlFor="dataMatricula" className={labelClass}>
                  Data de Matrícula
                </label>
                <input
                  type="date"
                  id="dataMatricula"
                  name="dataMatricula"
                  value={formData.dataMatricula}
                  onChange={(e) =>
                    handleInputChange("dataMatricula", e.target.value)
                  }
                  onBlur={() => handleBlur("dataMatricula")}
                  className={inputClass(
                    touched.dataMatricula && !!errors.dataMatricula
                  )}
                />
                <p className={errorTextClass}>
                  {touched.dataMatricula && errors.dataMatricula}
                </p>
              </div>

              {/* Campo Observações */}
              <div className={containerClass}>
                <label htmlFor="observacoes" className={labelClass}>
                  Observações (opcional)
                </label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={(e) =>
                    handleInputChange("observacoes", e.target.value)
                  }
                  onBlur={() => handleBlur("observacoes")}
                  rows={3}
                  className={inputClass(
                    touched.observacoes && !!errors.observacoes
                  )}
                />
                <p className={errorTextClass}>
                  {touched.observacoes && errors.observacoes}
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer/Actions */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition duration-150 transform hover:scale-[1.01] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || loadingData}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 transform hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Matriculando...
              </>
            ) : (
              "Matricular"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatricularAlunoModal;
