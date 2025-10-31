import { useEffect, useMemo, useState } from "react";
import Section from "../components/ui/Section";
import Field from "../components/forms/Field";
import Input from "../components/ui/Input";
import EditModal from "../components/ui/EditModal";
import ConfirmDeleteModal from "../components/ui/ConfirmDeleteModal";
import { validateRequired } from "../utils/validators";
import {
  getElevators,
  createElevator,
  updateElevator,
  removeElevator,
  onElevatorsChange,
} from "../services/elevatorsService";
import { money } from "../utils/formatters";

export default function Elevators() {
  const [list, setList] = useState([]);
  const [filtro, setFiltro] = useState("");

  const [form, setForm] = useState({
    modelo: "",
    capacidadeKg: "",
    velocidadeMps: "",
    preco: "",
  });
  const [errors, setErrors] = useState({});

  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    const load = () => getElevators().then(setList);
    load();
    const unsub = onElevatorsChange(load);
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    const t = (filtro || "").trim().toLowerCase();
    if (!t) return list;
    return list.filter((x) =>
      [
        String(x.id || "").toLowerCase(),
        String(x.modelo || "").toLowerCase(),
        String(x.capacidadeKg || ""),
        String(x.velocidadeMps || ""),
      ].some((s) => s.includes(t))
    );
  }, [list, filtro]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setEditField = (k, v) => setEditForm((f) => ({ ...f, [k]: v }));

  // CREATE
  async function handleSubmit(e) {
    e.preventDefault();
    const req = validateRequired(
      ["modelo", "capacidadeKg", "velocidadeMps", "preco"],
      form
    );
    setErrors(req);
    if (Object.keys(req).length) return;

    await createElevator({
      ...form,
      capacidadeKg: Number(form.capacidadeKg),
      velocidadeMps: Number(form.velocidadeMps),
      preco: Number(form.preco),
    });

    setForm({ modelo: "", capacidadeKg: "", velocidadeMps: "", preco: "" });
    setErrors({});
  }

  // EDIT
  function openEdit(item) {
    setEditForm({ ...item });
    setEditOpen(true);
  }

  async function saveEdit(e) {
    e.preventDefault();
    const req = validateRequired(
      ["modelo", "capacidadeKg", "velocidadeMps", "preco"],
      editForm
    );
    if (Object.keys(req).length) {
      alert("Preencha os campos obrigatórios.");
      return;
    }
    await updateElevator({
      ...editForm,
      capacidadeKg: Number(editForm.capacidadeKg),
      velocidadeMps: Number(editForm.velocidadeMps),
      preco: Number(editForm.preco),
    });
    setEditOpen(false);
  }

  // DELETE
  function requestDelete(item) {
    setToDelete(item);
    setConfirmOpen(true);
  }
  async function confirmDelete() {
    if (toDelete?.id) await removeElevator(toDelete.id);
    setConfirmOpen(false);
    setToDelete(null);
  }

  return (
    <>
      <Section
        title="Cadastro de Produtos"
        subtitle="Registre um novo produto."
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Field label="Modelo" error={errors.modelo}>
              <Input
                value={form.modelo}
                onChange={(e) => setField("modelo", e.target.value)}
              />
            </Field>

            <Field label="Capacidade (kg)" error={errors.capacidadeKg}>
              <Input
                type="number"
                value={form.capacidadeKg}
                onChange={(e) => setField("capacidadeKg", e.target.value)}
              />
            </Field>

            <Field label="Velocidade (m/s)" error={errors.velocidadeMps}>
              <Input
                type="number"
                step="0.1"
                value={form.velocidadeMps}
                onChange={(e) => setField("velocidadeMps", e.target.value)}
              />
            </Field>

            <Field label="Preço (R$)" error={errors.preco}>
              <Input
                type="number"
                value={form.preco}
                onChange={(e) => setField("preco", e.target.value)}
              />
            </Field>
          </div>

          <div className="actions">
            <button
              className="btn ghost"
              type="reset"
              onClick={() =>
                setForm({
                  modelo: "",
                  capacidadeKg: "",
                  velocidadeMps: "",
                  preco: "",
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

      <Section title="Produtos Cadastrados">
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
            placeholder="Filtrar por modelo ou código…"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
            {filtered.length} registro(s)
          </div>
        </div>

        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>Ações</th>
                <th>Modelo</th>
                <th>Capacidade</th>
                <th>Velocidade</th>
                <th>Preço</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-btn"
                        title="Editar"
                        onClick={() => openEdit(e)}
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-btn danger"
                        title="Excluir"
                        onClick={() => requestDelete(e)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                  <td>{e.modelo}</td>
                  <td>{e.capacidadeKg} kg</td>
                  <td>{e.velocidadeMps} m/s</td>
                  <td>{money(e.preco)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* MODAIS */}
      <EditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Editar Produto — ${editForm.modelo || ""}`}
        onSubmit={saveEdit}
      >
        <Field label="Modelo">
          <Input
            value={editForm.modelo ?? ""}
            onChange={(e) => setEditField("modelo", e.target.value)}
          />
        </Field>
        <Field label="Capacidade (kg)">
          <Input
            type="number"
            value={editForm.capacidadeKg ?? ""}
            onChange={(e) => setEditField("capacidadeKg", e.target.value)}
          />
        </Field>
        <Field label="Velocidade (m/s)">
          <Input
            type="number"
            step="0.1"
            value={editForm.velocidadeMps ?? ""}
            onChange={(e) => setEditField("velocidadeMps", e.target.value)}
          />
        </Field>
        <Field label="Preço (R$)">
          <Input
            type="number"
            value={editForm.preco ?? ""}
            onChange={(e) => setEditField("preco", e.target.value)}
          />
        </Field>
      </EditModal>

      <ConfirmDeleteModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        itemName={toDelete?.modelo || ""}
      />
    </>
  );
}
