import { useEffect, useMemo, useState } from "react";
import { getClients } from "../services/clientsService";
import { getElevatorsSeed, getModels } from "../services/elevatorsService";
import Section from "../components/ui/Section";
import Field from "../components/forms/Field";
import Select from "../components/forms/Select";
import Input from "../components/ui/Input";
import EditModal from "../components/ui/EditModal";
import ConfirmDeleteModal from "../components/ui/ConfirmDeleteModal";
import { money, dateBR } from "../utils/formatters";
import { validateRequired } from "../utils/validators";

export default function Elevators() {
  const [clients, setClients] = useState([]);
  const [models, setModels] = useState([]);
  const [seedList, setSeedList] = useState([]);
  const [localList, setLocalList] = useState(() =>
    JSON.parse(localStorage.getItem("elevators") || "[]")
  );
  const [deletedIds, setDeletedIds] = useState(() =>
    JSON.parse(localStorage.getItem("elevators_deleted") || "[]")
  );
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
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    Promise.all([getClients(), getModels(), getElevatorsSeed()])
      .then(([c, m, e]) => {
        setClients(c || []);
        setModels(m || []);
        setSeedList(Array.isArray(e) ? e : []);
      })
      .catch(() => {});
  }, []);

  const lista = useMemo(() => {
    const byId = new Map();
    for (const it of seedList) byId.set(it.id, it);
    for (const it of localList) byId.set(it.id, it);
    return Array.from(byId.values())
      .filter((x) => !deletedIds.includes(x.id))
      .filter(
        (x) =>
          x.modelo?.toLowerCase().includes(filtro.toLowerCase()) ||
          x.serie?.toLowerCase().includes(filtro.toLowerCase()) ||
          x.id.toLowerCase().includes(filtro.toLowerCase())
      );
  }, [seedList, localList, deletedIds, filtro]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setEditField = (k, v) => setEditForm((f) => ({ ...f, [k]: v }));

  const clientName = (id) => clients.find((c) => c.id === id)?.nome ?? id;
  const modeloNome = (id) => models.find((m) => m.id === id)?.nome ?? id;

  // === CADASTRAR ===
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
      ...form,
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
  }

  // === EDITAR ===
  function openEdit(item) {
    setEditForm(item);
    setEditOpen(true);
  }
  function saveEdit(e) {
    e.preventDefault();
    const updated = {
      ...editForm,
      modelo: modeloNome(editForm.modeloId),
    };
    const next = localList.some((x) => x.id === updated.id)
      ? localList.map((x) => (x.id === updated.id ? updated : x))
      : [...localList, updated];
    setLocalList(next);
    localStorage.setItem("elevators", JSON.stringify(next));
    setEditOpen(false);
  }

  // === EXCLUIR ===
  function requestDelete(item) {
    setToDelete(item);
    setConfirmOpen(true);
  }
  function confirmDelete() {
    const id = toDelete?.id;
    if (!id) return;
    const next = localList.filter((x) => x.id !== id);
    setLocalList(next);
    localStorage.setItem("elevators", JSON.stringify(next));
    setConfirmOpen(false);
    setToDelete(null);
  }

  return (
    <>
      <Section title="Cadastro de Elevadores">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Field label="Cliente" error={errors.clienteId}>
              <Select
                value={form.clienteId}
                onChange={(e) => setField("clienteId", e.target.value)}
                options={clients}
                placeholder="Selecione o cliente"
              />
            </Field>
            <Field label="Modelo" error={errors.modeloId}>
              <Select
                value={form.modeloId}
                onChange={(e) => setField("modeloId", e.target.value)}
                options={models}
                placeholder="Selecione o modelo"
              />
            </Field>
            <Field label="Capacidade (kg)">
              <Input
                type="number"
                value={form.capacidadeKg}
                onChange={(e) => setField("capacidadeKg", e.target.value)}
              />
            </Field>
            <Field label="Velocidade (m/s)">
              <Input
                type="number"
                step="0.1"
                value={form.velocidadeMps}
                onChange={(e) => setField("velocidadeMps", e.target.value)}
              />
            </Field>
            <Field label="Paradas">
              <Input
                type="number"
                value={form.paradas}
                onChange={(e) => setField("paradas", e.target.value)}
              />
            </Field>
            <Field label="Preço (R$)">
              <Input
                type="number"
                value={form.preco}
                onChange={(e) => setField("preco", e.target.value)}
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

      <Section title="Elevadores Cadastrados">
        <input
          className="input"
          placeholder="Filtrar..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 70 }}>Ações</th>
              <th>ID</th>
              <th>Cliente</th>
              <th>Modelo</th>
              <th>Preço</th>
              <th>Série</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((e) => (
              <tr key={e.id}>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => openEdit(e)}>
                      ✏️
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={() => requestDelete(e)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
                <td>{e.id}</td>
                <td>{clientName(e.clienteId)}</td>
                <td>{e.modelo}</td>
                <td>{money(e.preco)}</td>
                <td>{e.serie}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* === MODAIS === */}
      <EditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Editar Elevador — ${editForm.id}`}
        onSubmit={saveEdit}
      >
        <Field label="Cliente">
          <Select
            value={editForm.clienteId}
            onChange={(e) => setEditField("clienteId", e.target.value)}
            options={clients}
          />
        </Field>
        <Field label="Modelo">
          <Select
            value={editForm.modeloId}
            onChange={(e) => setEditField("modeloId", e.target.value)}
            options={models}
          />
        </Field>
        <Field label="Preço (R$)">
          <Input
            type="number"
            value={editForm.preco}
            onChange={(e) => setEditField("preco", e.target.value)}
          />
        </Field>
      </EditModal>

      <ConfirmDeleteModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        itemName={toDelete?.id}
      />
    </>
  );
}
