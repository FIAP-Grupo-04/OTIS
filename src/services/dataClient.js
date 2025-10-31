export async function fetchJson(file) {
  const res = await fetch(`/data/${file}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao carregar ${file}: ${res.status}`);
  return await res.json();
}
