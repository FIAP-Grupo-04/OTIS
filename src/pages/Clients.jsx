import { useEffect, useMemo, useState } from "react";
import { getClients } from "../services/clientsService";
import Section from "../components/ui/Section";
import Field from "../components/forms/Field";
import Input from "../components/ui/Input";
import EditModal from "../components/ui/EditModal";
import ConfirmDeleteModal from "../components/ui/ConfirmDeleteModal";

export default function Clients() {
  const [seedList, setSeedList] = useState([]);
  const [localList, setLocalList] = useState(
    JSON.parse(localStorage.getItem("clientes") || "[]")
  );
  const [deletedIds, setDeletedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("clientes_deleted") || "[]");
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
  });
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [toDelete, setToDelete] = useState(null);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    getClients()
      .then(setSeedList)
      .catch(() => {});
  }, []);

  const lista = useMemo(() => {
    const byId = new Map();
    for (const c of seedList) byId.set(String(c.id), c);
    for (const c of localList) byId.set(String(c.id), c);

    const del = new Set((deletedIds || []).map(String));
    const all = Array.from(byId.values()).filter((c) => !del.has(String(c.id)));

    const needle = (filtro || "").trim().toLowerCase();
    if (!needle) return all;

    return all.filter(
      (c) =>
        (c.nome || "").toLowerCase().includes(needle) ||
        (c.responsavel || "").toLowerCase().includes(needle) ||
        String(c.cnpj || "")
          .toLowerCase()
          .includes(needle)
    );
  }, [seedList, localList, deletedIds, filtro]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setEditField = (k, v) => setEditForm((f) => ({ ...f, [k]: v }));

  function handleSubmit(e) {
    e.preventDefault();
    const novo = { id: "CLI-" + Date.now(), ...form };
    const next = [...localList, novo];
    setLocalList(next);
    localStorage.setItem("clientes", JSON.stringify(next));
    setForm({ nome: "", cnpj: "", telefone: "", email: "" });
  }

  function openEdit(item) {
    setEditForm(item);
    setEditOpen(true);
  }
  function saveEdit(e) {
    e.preventDefault();
    const updated = { ...editForm };
    const next = localList.some((c) => c.id === updated.id)
      ? localList.map((c) => (c.id === updated.id ? updated : c))
      : [...localList, updated];
    setLocalList(next);
    localStorage.setItem("clientes", JSON.stringify(next));
    setEditOpen(false);
  }

  function requestDelete(item) {
    setToDelete(item ? { id: String(item.id), nome: item.nome } : null);
    setConfirmOpen(true);
  }

  function confirmDelete() {
    const id = String(toDelete?.id || "");
    if (!id) return;

    // se existir no localStorage, removemos de lá
    if (localList.some((c) => String(c.id) === id)) {
      const next = localList.filter((c) => String(c.id) !== id);
      setLocalList(next);
      localStorage.setItem("clientes", JSON.stringify(next));
    }

    const nextDel = Array.from(
      new Set([...(deletedIds || []).map(String), id])
    );
    setDeletedIds(nextDel);
    localStorage.setItem("clientes_deleted", JSON.stringify(nextDel));

    setConfirmOpen(false);
    setToDelete(null);
  }

  return (
    <>
      <Section title="Cadastro de Clientes">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Field label="Nome">
              <Input
                value={form.nome}
                onChange={(e) => setField("nome", e.target.value)}
              />
            </Field>
            <Field label="CNPJ">
              <Input
                value={form.cnpj}
                onChange={(e) => setField("cnpj", e.target.value)}
              />
            </Field>
            <Field label="Telefone">
              <Input
                value={form.telefone}
                onChange={(e) => setField("telefone", e.target.value)}
              />
            </Field>
            <Field label="E-mail">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
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

      <Section title="Clientes Cadastrados">
        <input
          className="input"
          style={{ maxWidth: 300, marginTop: 10, marginBottom: 10 }}
          placeholder="Filtrar por nome, responsável ou CNPJ"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />

        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 70 }}>Ações</th>
              <th>Nome</th>
              <th>CNPJ</th>
              <th>Telefone</th>
              <th>E-mail</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => openEdit(c)}>
                      ✏️
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={() => requestDelete(c)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
                <td>{c.nome}</td>
                <td>{c.cnpj}</td>
                <td>{c.telefone}</td>
                <td>{c.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <EditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Editar Cliente — ${editForm.nome}`}
        onSubmit={saveEdit}
      >
        <Field label="Nome">
          <Input
            value={editForm.nome}
            onChange={(e) => setEditField("nome", e.target.value)}
          />
        </Field>
        <Field label="CNPJ">
          <Input
            value={editForm.cnpj}
            onChange={(e) => setEditField("cnpj", e.target.value)}
          />
        </Field>
        <Field label="Telefone">
          <Input
            value={editForm.telefone}
            onChange={(e) => setEditField("telefone", e.target.value)}
          />
        </Field>
        <Field label="E-mail">
          <Input
            value={editForm.email}
            onChange={(e) => setEditField("email", e.target.value)}
          />
        </Field>
      </EditModal>

      <ConfirmDeleteModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        itemName={toDelete?.nome}
      />
    </>
  );
}
