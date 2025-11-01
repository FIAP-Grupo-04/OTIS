import { useEffect, useMemo, useState, useCallback } from "react";
import Section from "../components/ui/Section";
import Field from "../components/forms/Field";
import Input from "../components/ui/Input";
import Select from "../components/forms/Select";
import EditModal from "../components/ui/EditModal";
import ConfirmDeleteModal from "../components/ui/ConfirmDeleteModal";
import { validateRequired } from "../utils/validators";
import { dateBR } from "../utils/formatters";

import { getClients, onClientsChange } from "../services/clientsService";
import { getElevators, onElevatorsChange } from "../services/elevatorsService";
import {
  getOperations,
  createOperation,
  updateOperation,
  removeOperation,
  onOperationsChange,
} from "../services/operationsService";

const pickValue = (evOrVal) => {
  if (evOrVal && evOrVal.target) return evOrVal.target.value;
  if (typeof evOrVal === "object" && evOrVal !== null) {
    return evOrVal.id ?? evOrVal.value ?? "";
  }
  return evOrVal ?? "";
};

const normalize = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      typeof v === "string" ? v.trim() : v ?? "",
    ])
  );

const countryOptions = [
  "Argentina",
  "Bolívia",
  "Brasil",
  "Chile",
  "Colômbia",
  "Costa Rica",
  "Cuba",
  "Equador",
  "El Salvador",
  "Guatemala",
  "Honduras",
  "México",
  "Nicarágua",
  "Panamá",
  "Paraguai",
  "Peru",
  "Porto Rico",
  "República Dominicana",
  "Uruguai",
  "Venezuela",
  "Belize",
  "Guiana",
  "Suriname",
];

export default function Operations() {
  const [clients, setClients] = useState([]);
  const [elevators, setElevators] = useState([]);
  const [ops, setOps] = useState([]);

  const [q, setQ] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [paisFiltro, setPaisFiltro] = useState("");

  const [valorTouched, setValorTouched] = useState(false);
  const [valorTouchedEdit, setValorTouchedEdit] = useState(false);
  const [addrTouched, setAddrTouched] = useState(false);
  const [addrTouchedEdit, setAddrTouchedEdit] = useState(false);

  const [form, setForm] = useState({
    tipoOperacao: "Instalação",
    status: "Em Negociação",
    prioridade: "Média",
    clienteId: "",
    elevadorId: "",
    responsavelTecnico: "",
    dataAbertura: new Date().toISOString().slice(0, 10),
    dataLimite: "",
    valor: "",
    pais: "Brasil",
    enderecoEntrega: "",
    descricao: "",
  });
  const [errors, setErrors] = useState({});

  // edit/delete
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [toDelete, setToDelete] = useState(null);

  const reload = useCallback(async () => {
    const [c, e, o] = await Promise.all([
      getClients(),
      getElevators(),
      getOperations(),
    ]);
    setClients(c || []);
    setElevators(e || []);
    setOps(o || []);
  }, []);

  useEffect(() => {
    reload();
    const unsubC = onClientsChange(reload);
    const unsubE = onElevatorsChange(reload);
    const unsubO = onOperationsChange(reload);
    return () => {
      unsubC?.();
      unsubE?.();
      unsubO?.();
    };
  }, [reload]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setEditField = (k, v) => setEditForm((f) => ({ ...f, [k]: v }));

  // helpers de nome
  const productName = (id) => elevators.find((e) => e.id === id)?.modelo || "-";
  const clientName = (id) => clients.find((c) => c.id === id)?.nome || id;

  // ======= Autopreencher VALOR pelo produto (cadastro) =======
  useEffect(() => {
    if (!form.elevadorId || valorTouched) return;
    const ev = elevators.find((x) => x.id === form.elevadorId);
    if (ev && ev.preco != null)
      setForm((f) => ({ ...f, valor: String(ev.preco) }));
  }, [form.elevadorId, elevators, valorTouched]);

  // ======= Autopreencher ENDEREÇO pelo cliente (cadastro) =======
  useEffect(() => {
    if (!form.clienteId || addrTouched) return;
    const c = clients.find((x) => x.id === form.clienteId);
    if (c?.endereco) setForm((f) => ({ ...f, enderecoEntrega: c.endereco }));
  }, [form.clienteId, clients, addrTouched]);

  // ======= mesmos comportamentos no modal de edição =======
  useEffect(() => {
    if (!editOpen || !editForm.elevadorId || valorTouchedEdit) return;
    const ev = elevators.find((x) => x.id === editForm.elevadorId);
    if (ev?.preco != null)
      setEditForm((f) => ({ ...f, valor: String(ev.preco) }));
  }, [editOpen, editForm.elevadorId, elevators, valorTouchedEdit]);

  useEffect(() => {
    if (!editOpen || !editForm.clienteId || addrTouchedEdit) return;
    const c = clients.find((x) => x.id === editForm.clienteId);
    if (c?.endereco)
      setEditForm((f) => ({ ...f, enderecoEntrega: c.endereco }));
  }, [editOpen, editForm.clienteId, clients, addrTouchedEdit]);

  const tipoOptions = [
    { id: "Instalação", nome: "Instalação" },
    { id: "Manutenção", nome: "Manutenção" },
    { id: "Inspeção", nome: "Inspeção" },
  ];
  const statusOptions = [
    { id: "Em Negociação", nome: "Em Negociação" },
    { id: "Em Andamento", nome: "Em Andamento" },
    { id: "Aguardando Peças", nome: "Aguardando Peças" },
    { id: "Concluída", nome: "Concluída" },
  ];
  const priorOptions = [
    { id: "Alta", nome: "Alta" },
    { id: "Média", nome: "Média" },
    { id: "Baixa", nome: "Baixa" },
  ];

  // ======= CADASTRAR =======
  async function handleSubmit(e) {
    e.preventDefault();

    const norm = normalize(form);
    const req = validateRequired(
      [
        "tipoOperacao",
        "status",
        "prioridade",
        "clienteId",
        "elevadorId",
        "responsavelTecnico",
        "dataAbertura",
        "dataLimite",
      ],
      norm
    );
    setErrors(req);
    if (Object.keys(req).length) return;

    await createOperation({
      ...norm,
      valor: norm.valor ? Number(norm.valor) : 0,
    });
    await reload();

    setForm({
      tipoOperacao: "Instalação",
      status: "Em Negociação",
      prioridade: "Média",
      clienteId: "",
      elevadorId: "",
      responsavelTecnico: "",
      dataAbertura: new Date().toISOString().slice(0, 10),
      dataLimite: "",
      valor: "",
      pais: "Brasil",
      enderecoEntrega: "",
      descricao: "",
    });
    setValorTouched(false);
    setAddrTouched(false);
    setErrors({});
  }

  // ======= EDITAR =======
  function openEdit(item) {
    const cliente = clients.find((c) => c.id === item.clienteId);
    setEditForm({
      ...item,
      pais: item.pais || "Brasil",
      enderecoEntrega: item.enderecoEntrega || cliente?.endereco || "",
    });
    setValorTouchedEdit(false);
    setAddrTouchedEdit(false);
    setEditOpen(true);
  }

  async function saveEdit(e) {
    e.preventDefault();
    const norm = normalize(editForm);
    const req = validateRequired(
      [
        "tipoOperacao",
        "status",
        "prioridade",
        "clienteId",
        "elevadorId",
        "responsavelTecnico",
        "dataAbertura",
        "dataLimite",
      ],
      norm
    );
    if (Object.keys(req).length) {
      alert("Preencha os campos obrigatórios.");
      return;
    }
    await updateOperation({
      ...norm,
      valor: norm.valor ? Number(norm.valor) : 0,
    });
    await reload();
    setEditOpen(false);
  }

  // ======= EXCLUIR =======
  function requestDelete(item) {
    setToDelete(item);
    setConfirmOpen(true);
  }
  async function confirmDelete() {
    if (toDelete?.id) await removeOperation(toDelete.id);
    await reload();
    setConfirmOpen(false);
    setToDelete(null);
  }

  const lista = useMemo(() => {
    const term = (q || "").trim().toLowerCase();
    const base = Array.isArray(ops) ? ops : [];
    return base.filter((op) => {
      const okStatus = !statusFiltro || op.status === statusFiltro;
      const okPais = !paisFiltro || (op.pais || "") === paisFiltro;
      if (!term) return okStatus && okPais;

      const hay = [
        op.id,
        op.tipoOperacao,
        op.descricao,
        op.pais,
        op.enderecoEntrega,
        clientName(op.clienteId),
        productName(op.elevadorId),
        op.responsavelTecnico,
        op.status,
        op.prioridade,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return okStatus && okPais && hay.includes(term);
    });
  }, [ops, q, statusFiltro, paisFiltro, clients, elevators]);

  const badgeStatus = (s) =>
    /Conclu/i.test(s)
      ? "b-green"
      : /Andamento/i.test(s)
      ? "b-blue"
      : /Aguard/i.test(s)
      ? "b-yellow"
      : "b-orange";
  const badgePrior = (p) =>
    /Alta/i.test(p) ? "b-orange" : /M[eé]dia/i.test(p) ? "b-blue" : "b-green";

  return (
    <>
      <Section
        title="Cadastro de Operações"
        subtitle="Instalação, Manutenção e Inspeção."
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <Field label="Tipo de Operação" error={errors.tipoOperacao}>
              <Select
                value={form.tipoOperacao}
                onChange={(v) => setField("tipoOperacao", pickValue(v))}
                options={tipoOptions}
              />
            </Field>

            <Field label="Status" error={errors.status}>
              <Select
                value={form.status}
                onChange={(v) => setField("status", pickValue(v))}
                options={statusOptions}
              />
            </Field>

            <Field label="Prioridade" error={errors.prioridade}>
              <Select
                value={form.prioridade}
                onChange={(v) => setField("prioridade", pickValue(v))}
                options={priorOptions}
              />
            </Field>

            <Field label="Cliente" error={errors.clienteId}>
              <Select
                value={form.clienteId}
                onChange={(v) => {
                  setField("clienteId", pickValue(v));
                  if (!addrTouched) {
                    const cli = clients.find((c) => c.id === pickValue(v));
                    if (cli?.endereco)
                      setField("enderecoEntrega", cli.endereco);
                  }
                }}
                options={clients}
                placeholder="Selecione o cliente"
              />
            </Field>

            <Field label="Produto" error={errors.elevadorId}>
              <select
                className="input"
                value={form.elevadorId}
                onChange={(e) => {
                  const id = e.target.value;
                  setField("elevadorId", id);
                  if (!valorTouched) {
                    const ev = elevators.find((x) => x.id === id);
                    if (ev?.preco != null) setField("valor", String(ev.preco));
                  }
                }}
              >
                <option value="">Selecione um produto</option>
                {elevators.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.modelo}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Responsável Técnico"
              error={errors.responsavelTecnico}
            >
              <Input
                value={form.responsavelTecnico}
                onChange={(e) => setField("responsavelTecnico", e.target.value)}
              />
            </Field>

            <Field label="País">
              <select
                className="input"
                value={form.pais}
                onChange={(e) => setField("pais", e.target.value)}
              >
                {countryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
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

            <Field label="Valor (R$)">
              <Input
                type="number"
                value={form.valor}
                onChange={(e) => {
                  setValorTouched(true);
                  setField("valor", e.target.value);
                }}
              />
            </Field>

            <div className="col-span-2">
              <Field label="Endereço de Entrega">
                <textarea
                  className="input input-textarea"
                  rows={3}
                  maxLength={200}
                  value={form.enderecoEntrega}
                  onChange={(e) => {
                    setAddrTouched(true);
                    setField("enderecoEntrega", e.target.value);
                  }}
                  placeholder="Rua, número, bairro, cidade, UF, CEP"
                />
              </Field>
            </div>

            <div className="col-span-2">
              <Field label="Descrição (opcional)">
                <textarea
                  className="input input-textarea"
                  rows={4}
                  maxLength={150}
                  value={form.descricao}
                  onChange={(e) => setField("descricao", e.target.value)}
                />
                <div className="char-counter">
                  {(form.descricao || "").length}/150
                </div>
              </Field>
            </div>
          </div>

          <div className="actions">
            <button
              className="btn ghost"
              type="reset"
              onClick={() => {
                setForm({
                  tipoOperacao: "Instalação",
                  status: "Em Negociação",
                  prioridade: "Média",
                  clienteId: "",
                  elevadorId: "",
                  responsavelTecnico: "",
                  dataAbertura: new Date().toISOString().slice(0, 10),
                  dataLimite: "",
                  valor: "",
                  pais: "Brasil",
                  enderecoEntrega: "",
                  descricao: "",
                });
                setValorTouched(false);
                setAddrTouched(false);
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

      <Section title="Operações" subtitle="Filtros da tabela">
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
              style={{ maxWidth: 240 }}
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
              {statusOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={paisFiltro}
              onChange={(e) => setPaisFiltro(e.target.value)}
            >
              <option value="">Todos os países</option>
              {countryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
            {lista.length} operação(ões)
          </div>
        </div>

        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>Ações</th>
                <th>Código</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Cliente</th>
                <th>Produto</th>
                <th>Responsável Técnico</th>
                <th>Abertura</th>
                <th>Prazo</th>
                <th>País</th>
                <th>Endereço de Entrega</th>
                <th>Descrição</th>
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
                  <td>{op.tipoOperacao}</td>
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
                  <td>{clientName(op.clienteId)}</td>
                  <td>{productName(op.elevadorId)}</td>
                  <td>{op.responsavelTecnico || "-"}</td>
                  <td>{dateBR(op.dataAbertura)}</td>
                  <td>{dateBR(op.dataLimite)}</td>
                  <td>{op.pais || "-"}</td>
                  <td>{op.enderecoEntrega || "-"}</td>
                  <td>{op.descricao || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* MODAL EDIÇÃO */}
      <EditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Editar Operação — ${editForm.id || ""}`}
        onSubmit={saveEdit}
      >
        <div className="form-grid">
          <Field label="Tipo de Operação">
            <Select
              value={editForm.tipoOperacao || ""}
              onChange={(v) => setEditField("tipoOperacao", pickValue(v))}
              options={tipoOptions}
            />
          </Field>

          <Field label="Status">
            <Select
              value={editForm.status || "Em Negociação"}
              onChange={(v) => setEditField("status", pickValue(v))}
              options={statusOptions}
            />
          </Field>

          <Field label="Prioridade">
            <Select
              value={editForm.prioridade || "Média"}
              onChange={(v) => setEditField("prioridade", pickValue(v))}
              options={priorOptions}
            />
          </Field>

          <Field label="Cliente">
            <Select
              value={editForm.clienteId || ""}
              onChange={(v) => {
                const id = pickValue(v);
                setEditField("clienteId", id);
                if (!addrTouchedEdit) {
                  const cli = clients.find((c) => c.id === id);
                  if (cli?.endereco)
                    setEditField("enderecoEntrega", cli.endereco);
                }
              }}
              options={clients}
            />
          </Field>

          <Field label="Produto">
            <select
              className="input"
              value={editForm.elevadorId || ""}
              onChange={(e) => {
                const id = e.target.value;
                setEditField("elevadorId", id);
                if (!valorTouchedEdit) {
                  const ev = elevators.find((x) => x.id === id);
                  if (ev?.preco != null)
                    setEditField("valor", String(ev.preco));
                }
              }}
            >
              <option value="">Selecione um produto</option>
              {elevators.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.modelo}
                </option>
              ))}
            </select>
          </Field>

          <Field label="País">
            <select
              className="input"
              value={editForm.pais || "Brasil"}
              onChange={(e) => setEditField("pais", e.target.value)}
            >
              {countryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Responsável Técnico">
            <Input
              value={editForm.responsavelTecnico || ""}
              onChange={(e) =>
                setEditField("responsavelTecnico", e.target.value)
              }
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

          <Field label="Valor (R$)">
            <Input
              type="number"
              value={editForm.valor ?? ""}
              onChange={(e) => {
                setValorTouchedEdit(true);
                setEditField("valor", e.target.value);
              }}
            />
          </Field>

          <div className="col-span-2">
            <Field label="Endereço de Entrega">
              <textarea
                className="input input-textarea"
                rows={3}
                maxLength={200}
                value={editForm.enderecoEntrega || ""}
                onChange={(e) => {
                  setAddrTouchedEdit(true);
                  setEditField("enderecoEntrega", e.target.value);
                }}
                placeholder="Rua, número, bairro, cidade, UF, CEP"
              />
            </Field>
          </div>

          <div className="col-span-2">
            <Field label="Descrição (opcional)">
              <textarea
                className="input input-textarea"
                rows={4}
                maxLength={150}
                value={editForm.descricao || ""}
                onChange={(e) => setEditField("descricao", e.target.value)}
              />
              <div className="char-counter">
                {(editForm.descricao || "").length}/150
              </div>
            </Field>
          </div>
        </div>
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
