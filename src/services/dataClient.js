const _cache = new Map();

/**
 * Lê um JSON de /public/data com cache em memória.
 * Aceita "salesSummary.json" ou "/data/salesSummary.json".
 */
export async function fetchJson(path) {
  const url = path.startsWith("/") ? path : `/data/${path}`;
  if (_cache.has(url)) return _cache.get(url);

  const promise = fetch(url).then(async (res) => {
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Falha ao buscar ${url}: ${res.status} ${txt}`.trim());
    }
    return res.json();
  });

  _cache.set(url, promise);
  return promise;
}
