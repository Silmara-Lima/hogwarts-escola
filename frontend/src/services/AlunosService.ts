import api from "./api"; // Instância do Axios configurada com interceptor JWT

import type {
  AlunoDetalhe,
  AlunoDetalheAPI,
  CreateAlunoData,
  UpdateAlunoData,
  DisciplinaFrontEnd,
} from "../types/Alunos";

import type { Casa, Turma } from "../types/CasaeTurma";

// =========================================================

// AlunoListaBackend

// =========================================================

export interface AlunoListaBackend {
  id: number;

  nome: string;

  email: string;

  cpf: string;

  telefone: string;

  dataNascimento: string; // Vindo como string ISO do banco

  matricula: string;

  turno: string;

  turma: {
    id: number;

    serie: string;

    turno: string;

    curso?: { nome: string };
  };

  casa: {
    id: number;

    nome: string;
  };

  createdAt: string;

  updatedAt: string;
}

const BASE_URL = "/secretario/alunos";

// =========================================================

// AUXILIARES DE DATA

// =========================================================

// Converte DD/MM/AAAA -> YYYY-MM-DD (Usado apenas no UPDATE)
/*
const formatDataNascimento = (data?: string) => {
  if (!data) return undefined;

  if (data.includes("/")) {
    const [dia, mes, ano] = data.split("/").map(Number);

    if (dia > 31 || mes > 12 || ano < 1900)
      throw new Error("Data de nascimento inválida.");

    return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(
      2,

      "0"
    )}`;
  }

  return data; // já no formato ISO
};*/

/**

 * 💡 NOVO: Função para formatar a string ISO da API (YYYY-MM-DDT...)

 * para o formato brasileiro (DD/MM/AAAA) para exibição na tabela.

 * Você deve usar esta função no seu componente de listagem!

 */

export const formatarDataISOParaBR = (isoString: string): string => {
  if (!isoString) return "Data não informada";

  try {
    // Tenta criar o objeto Date. O .split('T')[0] evita problemas de fuso horário

    // se o backend estiver retornando a data no formato 'YYYY-MM-DD' puro.

    const date = new Date(isoString.split("T")[0].replace(/-/g, "/"));

    // Verifica se o objeto Date é válido (evita o NaN)

    if (isNaN(date.getTime())) {
      return "Data Inválida";
    }

    // Formata para DD/MM/AAAA

    const day = String(date.getDate()).padStart(2, "0");

    const month = String(date.getMonth() + 1).padStart(2, "0"); // Mês é 0-indexado

    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (e) {
    return "Erro de formato";
  }
};

// =========================================================

// FUNÇÃO PRINCIPAL PARA O ALUNO LOGADO (REINCLUÍDA)

// =========================================================

export const getAlunoDetalheMe = async (): Promise<AlunoDetalhe> => {
  const response = await api.get("/aluno/info");

  const dataBruta: AlunoDetalheAPI = response.data;

  // Mapeamento assumido como correto

  const disciplinasMapeadas: DisciplinaFrontEnd[] = dataBruta.matriculas.map(
    (m) => ({
      id: m.disciplina.id,

      nome: m.disciplina.nome,

      professor: m.disciplina.professor || "Professor(a) não informado(a)",
    })
  );

  return {
    id: dataBruta.id,

    nome: dataBruta.nome,

    email: dataBruta.email,

    cpf: dataBruta.cpf,

    telefone: dataBruta.telefone,

    dataNascimento: dataBruta.dataNascimento,

    matricula: dataBruta.matricula,

    turno: dataBruta.turma.turno || "Não Informado",

    nomeCasa: dataBruta.casa?.nome ?? "Casa não informada",

    disciplinas: disciplinasMapeadas,
  };
};

// =========================================================

// FUNÇÕES CRUD DE ALUNOS

// =========================================================

export const getAlunos = async (): Promise<AlunoListaBackend[]> => {
  try {
    const response = await api.get(BASE_URL);

    return response.data;
  } catch (error: any) {
    console.error("ERRO ao buscar lista de alunos:", error);

    if (error.response) {
      console.error("Status da Resposta:", error.response.status);

      console.error("Dados do Erro (Backend):", error.response.data);
    }

    throw new Error(
      "Falha ao carregar a lista de alunos. Verifique a autenticação ou o console."
    );
  }
};

export const getAlunoById = async (id: number): Promise<AlunoListaBackend> => {
  const response = await api.get(`${BASE_URL}/${id}`);

  return response.data;
};

export const createAluno = async (
  data: CreateAlunoData
): Promise<AlunoListaBackend> => {
  const { curso, ...dataPayload } = data; // Omitindo 'curso' do payload

  const payload = {
    ...dataPayload,

    casaId: dataPayload.casaId ?? undefined,
  };

  console.log("PAYLOAD FINAL ENVIADO PARA API:", JSON.stringify(payload));

  try {
    const response = await api.post(BASE_URL, payload);

    return response.data;
  } catch (error: any) {
    console.error("ERRO DE API ao criar aluno:", error);

    if (error.response) {
      console.error("Status da Resposta:", error.response.status);

      console.error("Dados do Erro (Backend):", error.response.data);

      const errorMessage =
        error.response.data.message ||
        error.response.data.error ||
        `Erro do servidor (Status ${error.response.status}).`;

      throw new Error(errorMessage);
    }

    throw error;
  }
};

export const updateAluno = async (
  id: number,
  data: UpdateAlunoData
): Promise<AlunoListaBackend> => {
  // O 'data' pode ter campos extras como 'isMock' ou 'id' se for um mock.
  // Usamos desestruturação para remover explicitamente esses campos extras.
  const {
    id: idRemovido,
    isMock: isMockRemovido,
    ...payloadLimpo
  } = data as any; // Usamos 'as any' temporariamente para a desestruturação

  // O `payloadLimpo` agora contém apenas os campos esperados pela API.

  console.log(
    `PAYLOAD FINAL ENVIADO PARA API (PATCH ID: ${id}):`,
    JSON.stringify(payloadLimpo, null, 2)
  );

  try {
    // Usamos o objeto 'payloadLimpo' filtrado
    const response = await api.patch(`${BASE_URL}/${id}`, payloadLimpo);
    return response.data;
  } catch (error) {
    console.error(`ERRO DE API ao atualizar aluno ${id}:`, error);
    throw error;
  }
};

// 🟢 FUNÇÃO DE EXCLUSÃO RESTAURADA
export const deleteAluno = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};

// =========================================================

// FUNÇÕES AUXILIARES

// =========================================================

export const getCasas = async (): Promise<Casa[]> => {
  const response = await api.get("/casas");

  return response.data;
};

export const getTurmas = async (): Promise<Turma[]> => {
  const response = await api.get("/turmas");

  return response.data;
};
