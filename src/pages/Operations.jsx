import { useEffect, useMemo, useState } from "react";
import { getClients } from "../services/clientsService";
import { getElevatorsSeed } from "../services/elevatorsService";
import {
  getOperationTypes,
  getTechnicians,
  getOperationsSeed,
} from "../services/operationsService";
import Section from "../components/ui/Section";
import Field from "../components/forms/Field";
import Select from "../components/forms/Select";
import { dateBR } from "../utils/formatters";
import { validateRequired } from "../utils/validators";

export default function Operations() {
  const [clients, setClients] = useState([]);
  const [elevators, setElevators] = useState([]);
  const [types, setTypes] = useState([]);
  const [techs, setTechs] = useState([]);
  const [seedOps, setSeedOps] = useState([]);
  const [localOps, setLocalOps] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("operations") || "[]");
    } catch {
      return [];
    }
  });

  const [q, setQ] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");

  const [form, setForm] = useState({
    tipoId: "",
    status: "Aberta",
    prioridade: "Média",
    clienteId: "",
    elevadorId: "",
    responsavelId: "",
    dataAbertura: new Date().toISOString().slice(0, 10),
    dataLimite: "",
    descricao: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    Promise.all([
      getClients(),
      getElevatorsSeed(),
      getOperationTypes(),
      getTechnicians(),
      getOperationsSeed(),
    ])
      .then(([c, e, t, tech, ops]) => {
        setClients(c);
        setElevators(Array.isArray(e) ? e : []);
        setTypes(t);
        setTechs(tech);
        setSeedOps(Array.isArray(ops) ? ops : []);
      })
      .catch(() => {});
  }, []);

  const lista = useMemo(() => {
    const merged = [...seedOps, ...localOps];
    const term = q.trim().toLowerCase();
    return merged.filter((op) => {
      const okStatus = !statusFiltro || op.status === statusFiltro;
      const hay = [
        op.id,
        op.descricao,
        clients.find((c) => c.id === op.clienteId)?.nome ?? "",
        op.elevadorId ?? "",
        types.find((t) => t.id === op.tipoId)?.nome ?? "",
        techs.find((t) => t.id === op.responsavelId)?.nome ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return okStatus && (!term || hay.includes(term));
    });
  }, [seedOps, localOps, q, statusFiltro, clients, types, techs]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function handleSubmit(e) {
    e.preventDefault();
    const req = validateRequired(
      [
        "tipoId",
        "clienteId",
        "responsavelId",
        "dataAbertura",
        "dataLimite",
        "descricao",
      ],
      form
    );
    setErrors(req);
    if (Object.keys(req).length) return;

    const novo = { id: "OP-" + String(Date.now()).slice(-6), ...form };
    const next = [...localOps, novo];
    setLocalOps(next);
    localStorage.setItem("operations", JSON.stringify(next));
    setForm({
      tipoId: "",
      status: "Aberta",
      prioridade: "Média",
      clienteId: "",
      elevadorId: "",
      responsavelId: "",
      dataAbertura: new Date().toISOString().slice(0, 10),
      dataLimite: "",
      descricao: "",
    });
    setErrors({});
    alert("Operação cadastrada!");
  }

  const badgeStatus = (s) =>
    /Conclu/i.test(s)
      ? "b-green"
      : /Andamento/i.test(s)
      ? "b-blue"
      : /Aguard/i.test(s)
      ? "b-yellow"
      : "b-orange";
  const badgePrior = (p) =>
    /Alta/i.test(p) ? "b-orange" : /Média/i.test(p) ? "b-blue" : "b-green";

  return (
    <>
      <Section
        title="Cadastro de Operações"
        subtitle="Registre novas instalações, manutenções e inspeções."
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Field label="Tipo" error={errors.tipoId}>
              <Select
                value={form.tipoId}
                onChange={(e) => setField("tipoId", e.target.value)}
                options={types}
                placeholder="Selecione o tipo"
              />
            </Field>
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                options={[
                  { id: "Aberta", nome: "Aberta" },
                  { id: "Em Andamento", nome: "Em Andamento" },
                  { id: "Aguardando Peças", nome: "Aguardando Peças" },
                  { id: "Concluída", nome: "Concluída" },
                ]}
              />
            </Field>
            <Field label="Prioridade">
              <Select
                value={form.prioridade}
                onChange={(e) => setField("prioridade", e.target.value)}
                options={[
                  { id: "Alta", nome: "Alta" },
                  { id: "Média", nome: "Média" },
                  { id: "Baixa", nome: "Baixa" },
                ]}
              />
            </Field>
            <Field label="Cliente" error={errors.clienteId}>
              <Select
                value={form.clienteId}
                onChange={(e) => setField("clienteId", e.target.value)}
                options={clients}
                placeholder="Selecione o cliente"
              />
            </Field>
            <Field label="Elevador (opcional)">
              <select
                className="input"
                value={form.elevadorId}
                onChange={(e) => setField("elevadorId", e.target.value)}
              >
                <option value="">Sem vínculo</option>
                {elevators.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.id} — {ev.modelo}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Responsável" error={errors.responsavelId}>
              <Select
                value={form.responsavelId}
                onChange={(e) => setField("responsavelId", e.target.value)}
                options={techs}
                placeholder="Selecione o técnico"
              />
            </Field>
            <Field label="Abertura" error={errors.dataAbertura}>
              <input
                className="input"
                type="date"
                value={form.dataAbertura}
                onChange={(e) => setField("dataAbertura", e.target.value)}
              />
            </Field>
            <Field label="Prazo" error={errors.dataLimite}>
              <input
                className="input"
                type="date"
                value={form.dataLimite}
                onChange={(e) => setField("dataLimite", e.target.value)}
              />
            </Field>
            <Field label="Descrição" error={errors.descricao}>
              <textarea
                className="input"
                rows={3}
                value={form.descricao}
                onChange={(e) => setField("descricao", e.target.value)}
              />
            </Field>
          </div>

          <div className="actions">
            <button
              className="btn ghost"
              type="reset"
              onClick={() => {
                setForm({
                  tipoId: "",
                  status: "Aberta",
                  prioridade: "Média",
                  clienteId: "",
                  elevadorId: "",
                  responsavelId: "",
                  dataAbertura: new Date().toISOString().slice(0, 10),
                  dataLimite: "",
                  descricao: "",
                });
                setErrors({});
              }}
            >
              Limpar
            </button>
            <button className="btn primary" type="submit">
              Salvar
            </button>
          </div>
        </form>
      </Section>

      <Section
        title="Operações"
        subtitle="Visão geral das operações (base + novas)."
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            <input
              className="input"
              style={{ maxWidth: 280 }}
              placeholder="Buscar por texto…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="input"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option>Aberta</option>
              <option>Em Andamento</option>
              <option>Aguardando Peças</option>
              <option>Concluída</option>
            </select>
          </div>
          <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
            {lista.length} operação(ões)
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Prioridade</th>
              <th>Cliente</th>
              <th>Elevador</th>
              <th>Responsável</th>
              <th>Abertura</th>
              <th>Prazo</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((op) => (
              <tr key={op.id}>
                <td>{op.id}</td>
                <td>{types.find((t) => t.id === op.tipoId)?.nome ?? ""}</td>
                <td>
                  <span className={`badge ${badgeStatus(op.status)}`}>
                    {op.status}
                  </span>
                </td>
                <td>
                  <span className={`badge ${badgePrior(op.prioridade)}`}>
                    {op.prioridade}
                  </span>
                </td>
                <td>
                  {clients.find((c) => c.id === op.clienteId)?.nome ?? ""}
                </td>
                <td>{op.elevadorId || "-"}</td>
                <td>
                  {techs.find((t) => t.id === op.responsavelId)?.nome ?? ""}
                </td>
                <td>{dateBR(op.dataAbertura)}</td>
                <td>{dateBR(op.dataLimite)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}
