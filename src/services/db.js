import { fetchJson } from "./dataClient";

const TABLES = {
  clients: "clients.json",
  elevators: "elevators.json",
  operations: "operations.json",
  users: "users.json",
};

const LS_PREFIX = "otis_db_";

async function readSeed(table) {
  const file = TABLES[table];
  return fetchJson(file);
}
function readLocal(table) {
  const raw = localStorage.getItem(LS_PREFIX + table);
  return raw ? JSON.parse(raw) : [];
}
function writeLocal(table, rows) {
  localStorage.setItem(LS_PREFIX + table, JSON.stringify(rows));
  subs[table]?.forEach((fn) => fn());
}

const subs = {};
export const subscribe = (table, fn) => {
  (subs[table] ||= []).push(fn);
  return () => (subs[table] = subs[table].filter((f) => f !== fn));
};

export async function list(table) {
  const [seed, local] = await Promise.all([readSeed(table), readLocal(table)]);

  const deletedIds = new Set(
    local.filter((r) => r && r.__deleted).map((r) => r.id)
  );

  const byId = new Map();
  for (const r of seed) {
    if (!deletedIds.has(r.id)) byId.set(r.id, r);
  }

  for (const r of local) {
    if (r && r.__deleted) {
      byId.delete(r.id);
    } else {
      byId.set(r.id, r);
    }
  }

  return Array.from(byId.values());
}

export async function create(table, data) {
  const rows = readLocal(table);

  // prefixo direto aqui (sem helper externo)
  const prefix =
    table === "elevators"  ? "ELV-" :
    table === "operations" ? "OP-"  :
    table === "clients"    ? "CLI-" :
    table === "users"      ? "USR-" :
                             "ID-";

  // respeita id vindo de fora; se não vier, gera olhando seed + local
  let id = data?.id;
  if (!id) {
    // pega a lista mesclada (seed + local, já com deletes resolvidos)
    const merged = await list(table); // <- usa sua própria list() que já mescla tudo

    // maior sufixo numérico para este prefixo
    let max = 0;
    for (const r of merged) {
      const rid = r?.id;
      if (typeof rid === "string" && rid.startsWith(prefix)) {
        const n = parseInt(rid.slice(prefix.length), 10);
        if (!Number.isNaN(n) && n > max) max = n;
      }
    }

    const next = String(max + 1).padStart(4, "0");
    id = `${prefix}${next}`;
  }

  // remove qualquer registro local com o mesmo id (inclui __deleted)
  const nextLocal = rows.filter((r) => r?.id !== id);

  // grava no localStorage e notifica
  const row = { ...data, id };
  writeLocal(table, [...nextLocal, row]);
  return row;
}

export async function update(table, data) {
  const rows = readLocal(table);
  const idx = rows.findIndex((r) => r.id === data.id && !r.__deleted);
  if (idx === -1) {
    rows.push({ ...data });
  } else {
    rows[idx] = { ...rows[idx], ...data };
  }
  writeLocal(table, rows);
  return data;
}

export async function remove(table, id) {
  const rows = readLocal(table);
  const hadLocal = rows.some((r) => r.id === id && !r.__deleted);

  let next;
  if (hadLocal) {
    next = rows.filter((r) => r.id !== id);
  } else {
    next = [...rows, { id, __deleted: true }];
  }
  writeLocal(table, next);
}
