import { useEffect, useMemo, useState } from "react";
import Section from "../components/ui/Section";
import Field from "../components/forms/Field";
import Input from "../components/ui/Input";
import EditModal from "../components/ui/EditModal";
import ConfirmDeleteModal from "../components/ui/ConfirmDeleteModal";
import { validateRequired, isEmail } from "../utils/validators";
import {
  getClients,
  createClient,
  updateClient,
  removeClient,
  onClientsChange,
} from "../services/clientsService";

const normalize = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      typeof v === "string" ? v.trim() : v ?? "",
    ])
  );

export default function Clients() {
  const [list, setList] = useState([]);
  const [filtro, setFiltro] = useState("");

  const [form, setForm] = useState({
    nome: "",
    cpfCnpj: "",
    responsavel: "",
    telefone: "",
    email: "",
    endereco: "",
  });
  const [errors, setErrors] = useState({});

  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    const load = () => getClients().then(setList);
    load();
    const unsub = onClientsChange(load);
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    const t = (filtro || "").trim().toLowerCase();
    if (!t) return list;
    return list.filter((c) => {
      const doc = (c.cpfCnpj ?? c.cnpj ?? "").toLowerCase();
      return (
        (c.nome || "").toLowerCase().includes(t) ||
        (c.responsavel || "").toLowerCase().includes(t) ||
        doc.includes(t)
      );
    });
  }, [list, filtro]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setEditField = (k, v) => setEditForm((f) => ({ ...f, [k]: v }));

  // CREATE
  async function handleSubmit(e) {
    e.preventDefault();
    const norm = normalize(form);
    const req = validateRequired(
      ["nome", "cpfCnpj", "responsavel", "telefone", "email", "endereco"],
      norm
    );
    if (norm.email && !isEmail(norm.email)) req.email = "E-mail inválido.";
    setErrors(req);
    if (Object.keys(req).length) return;

    await createClient(norm);
    setForm({
      nome: "",
      cpfCnpj: "",
      responsavel: "",
      telefone: "",
      email: "",
      endereco: "",
    });
    setErrors({});
  }

  // EDIT
  function openEdit(item) {
    setEditForm({
      id: item.id,
      nome: item.nome || "",
      cpfCnpj: item.cpfCnpj ?? item.cnpj ?? "",
      responsavel: item.responsavel || "",
      endereco: item.endereco || "",
      email: item.email || "",
      telefone: item.telefone || "",
    });
    setEditOpen(true);
  }

  async function saveEdit(e) {
    e.preventDefault();
    const norm = normalize(editForm);
    const req = validateRequired(
      ["nome", "cpfCnpj", "responsavel", "telefone", "email", "endereco"],
      norm
    );
    if (norm.email && !isEmail(norm.email)) req.email = "E-mail inválido.";
    if (Object.keys(req).length) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    await updateClient(norm);
    setEditOpen(false);
  }

  // DELETE
  function requestDelete(item) {
    setToDelete(item);
    setConfirmOpen(true);
  }
  async function confirmDelete() {
    if (toDelete?.id) await removeClient(toDelete.id);
    setConfirmOpen(false);
    setToDelete(null);
  }

  return (
    <>
      <Section
        title="Cadastro de Clientes"
        subtitle="Registre um novo cliente."
      >
        <form onSubmit={handleSubmit}>
          <div
            className="form-grid"
            style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
          >
            <Field label="Nome" error={errors.nome}>
              <Input
                value={form.nome}
                onChange={(e) => setField("nome", e.target.value)}
              />
            </Field>
            <Field label="CNPJ" error={errors.cpfCnpj}>
              <Input
                value={form.cpfCnpj}
                onChange={(e) => setField("cpfCnpj", e.target.value)}
              />
            </Field>
            <Field label="Responsável" error={errors.responsavel}>
              <Input
                value={form.responsavel}
                onChange={(e) => setField("responsavel", e.target.value)}
              />
            </Field>
            <Field label="Telefone" error={errors.telefone}>
              <Input
                value={form.telefone}
                onChange={(e) => setField("telefone", e.target.value)}
              />
            </Field>
            <Field label="E-mail" error={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </Field>
            <Field label="Endereço" error={errors.endereco}>
              <Input
                value={form.endereco}
                onChange={(e) => setField("endereco", e.target.value)}
              />
            </Field>
          </div>
          <div className="actions">
            <button
              type="reset"
              className="btn ghost"
              onClick={() =>
                setForm({
                  nome: "",
                  cpfCnpj: "",
                  responsavel: "",
                  telefone: "",
                  email: "",
                  endereco: "",
                })
              }
            >
              Limpar
            </button>
            <button className="btn primary" type="submit">
              Salvar
            </button>
          </div>
        </form>
      </Section>

      <Section title="Clientes Cadastrados">
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
            style={{ maxWidth: 340 }}
            placeholder="Filtrar por nome, responsável ou CNPJ/CPF"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
            {filtered.length} cliente(s)
          </div>
        </div>

        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>Ações</th>
                <th>Nome</th>
                <th>CNPJ</th>
                <th>Responsável</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Endereço</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-btn"
                        title="Editar"
                        onClick={() => openEdit(c)}
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-btn danger"
                        title="Excluir"
                        onClick={() => requestDelete(c)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                  <td>{c.nome}</td>
                  <td>{c.cpfCnpj ?? c.cnpj ?? "-"}</td>
                  <td>{c.responsavel ?? "-"}</td>
                  <td>{c.telefone ?? "-"}</td>
                  <td>{c.email ?? "-"}</td>
                  <td>{c.endereco ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Modais */}
      <EditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Editar Cliente — ${editForm.id || ""}`}
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
            value={editForm.cpfCnpj}
            onChange={(e) => setEditField("cpfCnpj", e.target.value)}
          />
        </Field>
        <Field label="Responsável">
          <Input
            value={editForm.responsavel}
            onChange={(e) => setEditField("responsavel", e.target.value)}
          />
        </Field>
        <Field label="Endereço">
          <Input
            value={editForm.endereco}
            onChange={(e) => setEditField("endereco", e.target.value)}
          />
        </Field>
        <Field label="E-mail">
          <Input
            value={editForm.email}
            onChange={(e) => setEditField("email", e.target.value)}
          />
        </Field>
        <Field label="Telefone">
          <Input
            value={editForm.telefone}
            onChange={(e) => setEditField("telefone", e.target.value)}
          />
        </Field>
      </EditModal>

      <ConfirmDeleteModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        itemName={toDelete?.nome || ""}
      />
    </>
  );
}
