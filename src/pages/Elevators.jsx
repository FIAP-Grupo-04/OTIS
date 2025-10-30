import { useEffect, useMemo, useState } from "react";
import { getClients } from "../services/clientsService";
import { getElevatorsSeed, getModels } from "../services/elevatorsService";
import Section from "../components/ui/Section";
import Field from "../components/forms/Field";
import Select from "../components/forms/Select";
import { money, dateBR } from "../utils/formatters";
import { validateRequired } from "../utils/validators";

export default function Elevators() {
  const [clients, setClients] = useState([]);
  const [models, setModels] = useState([]);
  const [seedList, setSeedList] = useState([]);
  const [localList, setLocalList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("elevators") || "[]");
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({
    clienteId: "",
    modeloId: "",
    capacidadeKg: "",
    velocidadeMps: "",
    paradas: "",
    status: "Em Negociação",
    preco: "",
    instalacaoPrevista: "",
    serie: "",
  });
  const [errors, setErrors] = useState({});
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    Promise.all([getClients(), getModels(), getElevatorsSeed()])
      .then(([c, m, e]) => {
        setClients(c);
        setModels(m);
        setSeedList(Array.isArray(e) ? e : []);
      })
      .catch(() => {});
  }, []);

  const lista = useMemo(() => {
    const all = [...seedList, ...localList];
    if (!filtro) return all;
    const t = filtro.toLowerCase();
    return all.filter(
      (x) =>
        (x.modelo || "").toLowerCase().includes(t) ||
        (x.serie || "").toLowerCase().includes(t)
    );
  }, [seedList, localList, filtro]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const clientName = (id) => clients.find((c) => c.id === id)?.nome ?? id;
  const modeloNome = (id) => models.find((m) => m.id === id)?.nome ?? id;

  function handleSubmit(e) {
    e.preventDefault();
    const req = validateRequired(
      [
        "clienteId",
        "modeloId",
        "capacidadeKg",
        "velocidadeMps",
        "paradas",
        "preco",
        "instalacaoPrevista",
        "serie",
      ],
      form
    );
    setErrors(req);
    if (Object.keys(req).length) return;

    const novo = {
      id: `ELV-${String(Date.now()).slice(-6)}`,
      modelo: modeloNome(form.modeloId),
      clienteId: form.clienteId,
      capacidadeKg: Number(form.capacidadeKg),
      velocidadeMps: Number(form.velocidadeMps),
      paradas: Number(form.paradas),
      status: form.status,
      preco: Number(form.preco),
      instalacaoPrevista: form.instalacaoPrevista,
      serie: form.serie,
    };

    const next = [...localList, novo];
    setLocalList(next);
    localStorage.setItem("elevators", JSON.stringify(next));
    setForm({
      clienteId: "",
      modeloId: "",
      capacidadeKg: "",
      velocidadeMps: "",
      paradas: "",
      status: "Em Negociação",
      preco: "",
      instalacaoPrevista: "",
      serie: "",
    });
    setErrors({});
    alert("Elevador cadastrado!");
  }

  return (
    <>
      <Section
        title="Cadastro de Elevadores"
        subtitle="Preencha os campos para cadastrar um novo elevador."
      >
        <form onSubmit={handleSubmit}>
          <div
            className="form-grid"
            style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
          >
            <Field label="Nome do Modelo" error={errors.capacidadeKg}>
              <input
                className="input"
                type="text"
                value={form.capacidadeKg}
                onChange={(e) => setField("capacidadeKg", e.target.value)}
              />
            </Field>
            <Field label="Capacidade (kg)" error={errors.capacidadeKg}>
              <input
                className="input"
                type="number"
                min="100"
                value={form.capacidadeKg}
                onChange={(e) => setField("capacidadeKg", e.target.value)}
              />
            </Field>
            <Field label="Velocidade (m/s)" error={errors.velocidadeMps}>
              <input
                className="input"
                type="number"
                step="0.1"
                value={form.velocidadeMps}
                onChange={(e) => setField("velocidadeMps", e.target.value)}
              />
            </Field>
            <Field label="Preço (R$)" error={errors.preco}>
              <input
                className="input"
                type="number"
                step="100"
                value={form.preco}
                onChange={(e) => setField("preco", e.target.value)}
              />
            </Field>
            <Field label="Nº de Série" error={errors.serie}>
              <input
                className="input"
                value={form.serie}
                onChange={(e) => setField("serie", e.target.value)}
              />
            </Field>
          </div>

          <div className="actions">
            <button
              className="btn ghost"
              type="reset"
              onClick={() => {
                setForm({
                  clienteId: "",
                  modeloId: "",
                  capacidadeKg: "",
                  velocidadeMps: "",
                  paradas: "",
                  status: "Em Negociação",
                  preco: "",
                  instalacaoPrevista: "",
                  serie: "",
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
        title="Elevadores Cadastrados"
        subtitle="Consulta dos registros (base + novos)."
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <input
            className="input"
            style={{ maxWidth: 320 }}
            placeholder="Filtrar por modelo ou série…"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
            {lista.length} registro(s)
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Modelo</th>
              <th>Capacidade</th>
              <th>Velocidade</th>
              <th>Preço</th>
              <th>Série</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((e) => (
              <tr key={e.id}>
                <td>{e.id}</td>
                <td>{e.modelo}</td>
                <td>{e.capacidadeKg} kg</td>
                <td>{e.velocidadeMps} m/s</td>
                <td>{money(e.preco)}</td>
                <td>{e.serie}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}
