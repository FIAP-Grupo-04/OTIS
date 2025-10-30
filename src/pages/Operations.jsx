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
import Input from "../components/ui/Input";
import EditModal from "../components/ui/EditModal";
import ConfirmDeleteModal from "../components/ui/ConfirmDeleteModal";
import { dateBR } from "../utils/formatters";
import { validateRequired } from "../utils/validators";

export default function Operations() {
  const [clients, setClients] = useState([]);
  const [elevators, setElevators] = useState([]);
  const [types, setTypes] = useState([]);
  const [techs, setTechs] = useState([]);

  const [seedOps, setSeedOps] = useState([]);
  const [localOps, setLocalOps] = useState(() =>
    JSON.parse(localStorage.getItem("operations") || "[]")
  );
  const [deletedIds, setDeletedIds] = useState(() =>
    JSON.parse(localStorage.getItem("operations_deleted") || "[]")
  );

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

  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    Promise.all([
      getClients(),
      getElevatorsSeed(),
      getOperationTypes(),
      getTechnicians(),
      getOperationsSeed(),
    ])
      .then(([c, e, t, tech, ops]) => {
        setClients(c || []);
        setElevators(Array.isArray(e) ? e : []);
        setTypes(t || []);
        setTechs(tech || []);
        setSeedOps(Array.isArray(ops) ? ops : []);
      })
      .catch(() => {});
  }, []);

  const lista = useMemo(() => {
    const byId = new Map();
    for (const o of seedOps) byId.set(o.id, o);
    for (const o of localOps) byId.set(o.id, o);
    const merged = Array.from(byId.values()).filter(
      (o) => !deletedIds.includes(o.id)
    );

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
  }, [seedOps, localOps, deletedIds, q, statusFiltro, clients, types, techs]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setEditField = (k, v) => setEditForm((f) => ({ ...f, [k]: v }));

  // CADASTRAR
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
  }

  // EDITAR
  function openEdit(item) {
    setEditForm({ ...item });
    setEditOpen(true);
  }
  function saveEdit(e) {
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
      editForm
    );
    if (Object.keys(req).length) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    const updated = { ...editForm };
    const existsLocal = localOps.some((o) => o.id === updated.id);
    const next = existsLocal
      ? localOps.map((o) => (o.id === updated.id ? updated : o))
      : [...localOps, updated];
    setLocalOps(next);
    localStorage.setItem("operations", JSON.stringify(next));
    setEditOpen(false);
  }

  // EXCLUIR
  function requestDelete(item) {
    setToDelete(item);
    setConfirmOpen(true);
  }
  function confirmDelete() {
    const id = toDelete?.id;
    if (!id) return;

    if (localOps.some((o) => o.id === id)) {
      const next = localOps.filter((o) => o.id !== id);
      setLocalOps(next);
      localStorage.setItem("operations", JSON.stringify(next));
    } else {
      const nextDel = [...new Set([...(deletedIds || []), id])];
      setDeletedIds(nextDel);
      localStorage.setItem("operations_deleted", JSON.stringify(nextDel));
    }

    setConfirmOpen(false);
    setToDelete(null);
  }

  return (
    <>
      <Section
        title="Cadastro de Operações"
        subtitle="Instalações, manutenções e inspeções."
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
              <Input
                type="date"
                value={form.dataAbertura}
                onChange={(e) => setField("dataAbertura", e.target.value)}
              />
            </Field>
            <Field label="Prazo" error={errors.dataLimite}>
              <Input
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
            <button className="btn primary" type="submit">
              Salvar
            </button>
          </div>
        </form>
      </Section>

      <Section title="Operações" subtitle="Base pública + novos registros.">
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
              placeholder="Buscar…"
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
              <th style={{ width: 70 }}>Ações</th>
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
                <td>
                  <div className="row-actions">
                    <button
                      className="icon-btn"
                      title="Editar"
                      onClick={() => openEdit(op)}
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-btn danger"
                      title="Excluir"
                      onClick={() => requestDelete(op)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
                <td>{op.id}</td>
                <td>{types.find((t) => t.id === op.tipoId)?.nome ?? ""}</td>
                <td>{op.status}</td>
                <td>{op.prioridade}</td>
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

      {/* MODAIS */}
      <EditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Editar Operação — ${editForm.id || ""}`}
        onSubmit={saveEdit}
      >
        <Field label="Tipo">
          <Select
            value={editForm.tipoId || ""}
            onChange={(e) => setEditField("tipoId", e.target.value)}
            options={types}
          />
        </Field>
        <Field label="Status">
          <Select
            value={editForm.status || "Aberta"}
            onChange={(e) => setEditField("status", e.target.value)}
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
            value={editForm.prioridade || "Média"}
            onChange={(e) => setEditField("prioridade", e.target.value)}
            options={[
              { id: "Alta", nome: "Alta" },
              { id: "Média", nome: "Média" },
              { id: "Baixa", nome: "Baixa" },
            ]}
          />
        </Field>
        <Field label="Cliente">
          <Select
            value={editForm.clienteId || ""}
            onChange={(e) => setEditField("clienteId", e.target.value)}
            options={clients}
          />
        </Field>
        <Field label="Elevador">
          <select
            className="input"
            value={editForm.elevadorId || ""}
            onChange={(e) => setEditField("elevadorId", e.target.value)}
          >
            <option value="">Sem vínculo</option>
            {elevators.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.id} — {ev.modelo}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Responsável">
          <Select
            value={editForm.responsavelId || ""}
            onChange={(e) => setEditField("responsavelId", e.target.value)}
            options={techs}
          />
        </Field>
        <Field label="Abertura">
          <Input
            type="date"
            value={editForm.dataAbertura || ""}
            onChange={(e) => setEditField("dataAbertura", e.target.value)}
          />
        </Field>
        <Field label="Prazo">
          <Input
            type="date"
            value={editForm.dataLimite || ""}
            onChange={(e) => setEditField("dataLimite", e.target.value)}
          />
        </Field>
        <Field label="Descrição">
          <textarea
            className="input"
            rows={3}
            value={editForm.descricao || ""}
            onChange={(e) => setEditField("descricao", e.target.value)}
          />
        </Field>
      </EditModal>

      <ConfirmDeleteModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        itemName={toDelete?.id || ""}
      />
    </>
  );
}
