import { list, create, update, remove, subscribe } from "./db";
import { getElevators } from "./elevatorsService";

export const getOperations = () => list("operations");
export const createOperation = (data) => create("operations", data);
export const updateOperation = (data) => update("operations", data);
export const removeOperation = (id) => remove("operations", id);
export const onOperationsChange = (fn) => subscribe("operations", fn);

export async function getOpenSales() {
  const ops = await list("operations");
  return ops.filter(
    (o) => String(o.status).toLowerCase().includes("conclu") === false
  );
}

export async function getSalesByStatus() {
  const ops = await list("operations");
  const bucket = (s = "") => {
    const t = s.toLowerCase();
    if (t.includes("conclu")) return "Concluída";
    if (t.includes("aguard")) return "Aguardando Peças";
    if (t.includes("andamento") || t.includes("instala") || t.includes("produ"))
      return "Em Andamento";
    return "Em Negociação";
  };
  return ops.reduce((acc, o) => {
    const k = bucket(o.status);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

export async function getSalesByMonth() {
  const ops = await list("operations");
  const keyOf = (s) => {
    if (!s) return null;
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
  };
  return ops.reduce((acc, o) => {
    const k = keyOf(o.dataAbertura);
    if (!k) return acc;
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

export async function getSalesSummary() {
  const [ops, elevs] = await Promise.all([list("operations"), getElevators()]);

  const total = ops.length;

  const faturamento = ops.reduce((acc, o) => acc + Number(o.valor || 0), 0);

  const pendentes = ops.filter(
    (o) => String(o.status).toLowerCase().includes("conclu") === false
  ).length;

  const modelByElev = new Map(elevs.map((e) => [e.id, e.modelo]));
  const countByModel = {};
  for (const o of ops) {
    const modelo = modelByElev.get(o.elevadorId) || "—";
    countByModel[modelo] = (countByModel[modelo] || 0) + 1;
  }
  let modeloMais = "—";
  let max = -1;
  for (const [m, c] of Object.entries(countByModel)) {
    if (c > max) {
      modeloMais = m;
      max = c;
    }
  }

  return {
    total,
    faturamento,
    pendentes,
    modeloMais,
    deltas: { total: 5, faturamento: 8, pendentes: -4, modelo: 2 },
  };
}
