// src/services/dataClient.js
export async function fetchJson(file) {
  // tudo que está em /public/data/ vira disponível em /data/<file>
  const res = await fetch(`/data/${file}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao carregar ${file}: ${res.status}`);
  return await res.json();
}
