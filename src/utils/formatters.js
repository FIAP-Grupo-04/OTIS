/** Formata número em moeda BRL (ex.: 12345 → R$ 12.345) */
export const money = (v) =>
  Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

/** Formata string de data (ISO ou Date) no formato brasileiro */
export const dateBR = (s) => {
  if (!s) return "-";
  const d = new Date(s);
  return isNaN(d) ? s : d.toLocaleDateString("pt-BR");
};

/** Capitaliza a primeira letra da string */
export const capitalize = (s) =>
  typeof s === "string" && s.length ? s[0].toUpperCase() + s.slice(1) : s;
