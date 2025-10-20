import { fetchJson } from "./dataClient";

/**
 * Retorna o resumo geral de vendas (cards do topo do Dashboard).
 */
export const getSalesSummary = async () => fetchJson("salesSummary.json");

/**
 * Retorna dados mensais para o gráfico de barras (vendas por mês).
 */
export const getSalesByMonth = async () => fetchJson("salesByMonth.json");

/**
 * Retorna o status agregado das vendas (negociação, preparação etc.).
 */
export const getSalesStatus = async () => fetchJson("salesStatus.json");

/**
 * Retorna a lista de vendas abertas (tabela inferior do Dashboard).
 */
export const getSalesOpen = async () => fetchJson("salesOpen.json");
