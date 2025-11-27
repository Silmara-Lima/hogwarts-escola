// src/utils/DataUtils.ts

/**
 * Converte a string de data ISO (ex: "2000-01-15T03:00:00.000Z" ou "2000-01-15")
 * para o formato brasileiro (DD/MM/AAAA) para exibição em tabelas.
 * * @param isoString A string de data vinda da API.
 * @returns A data formatada em DD/MM/AAAA ou uma string de erro.
 */
export const formatarDataISOParaBR = (isoString: string): string => {
  if (!isoString) return "Data não informada";

  try {
    // 1. Prepara a string para o construtor Date().
    // Substituir '-' por '/' e pegar apenas a parte da data (split('T')[0])
    // garante que o navegador a interprete corretamente, mitigando problemas de fuso horário.
    const date = new Date(isoString.split("T")[0].replace(/-/g, "/"));

    // 2. Verifica se o objeto Date é válido (evita o NaN/NaN/NaN)
    if (isNaN(date.getTime())) {
      return "Data Inválida";
    }

    // 3. Formata para DD/MM/AAAA.
    // Usamos métodos getUTC* para evitar que a conversão de fuso horário
    // mude o dia (ex: 15/01 -> 14/01).
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Mês é 0-indexado
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  } catch (e) {
    return "Erro de formato";
  }
};
