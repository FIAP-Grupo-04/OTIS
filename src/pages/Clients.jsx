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
  const [deletedIds, setDeletedIds] = useState(
    JSON.parse(localStorage.getItem("clientes_deleted") || "[]")
  );
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

  useEffect(() => {
    getClients()
      .then(setSeedList)
      .catch(() => {});
  }, []);

  const lista = useMemo(() => {
    const byId = new Map();
    for (const c of seedList) byId.set(c.id, c);
    for (const c of localList) byId.set(c.id, c);
    return Array.from(byId.values()).filter((x) => !deletedIds.includes(x.id));
  }, [seedList, localList, deletedIds]);

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
    setToDelete(item);
    setConfirmOpen(true);
  }
  function confirmDelete() {
    const id = toDelete?.id;
    const next = localList.filter((c) => c.id !== id);
    setLocalList(next);
    localStorage.setItem("clientes", JSON.stringify(next));
    setConfirmOpen(false);
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
