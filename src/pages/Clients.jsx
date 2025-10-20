import { useEffect, useMemo, useState } from "react";
import { getClients } from "../services/clientsService";
import Section from "../components/ui/Section";
import Field from "../components/forms/Field";
import { validateRequired, isEmail } from "../utils/validators";

export default function Clients() {
  const [seedList, setSeedList] = useState([]);
  const [localList, setLocalList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("clientes") || "[]");
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    responsavel: "",
    telefone: "",
    email: "",
    endereco: "",
  });
  const [errors, setErrors] = useState({});
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    getClients()
      .then(setSeedList)
      .catch(() => setSeedList([]));
  }, []);

  const lista = useMemo(() => {
    const all = [...seedList, ...localList];
    if (!filtro) return all;
    const t = filtro.toLowerCase();
    return all.filter(
      (c) =>
        c.nome.toLowerCase().includes(t) ||
        c.responsavel.toLowerCase().includes(t) ||
        c.cnpj.includes(filtro)
    );
  }, [seedList, localList, filtro]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function handleSubmit(e) {
    e.preventDefault();
    const req = validateRequired(
      ["nome", "cnpj", "responsavel", "telefone", "email", "endereco"],
      form
    );
    if (form.email && !isEmail(form.email)) req.email = "E-mail inválido.";
    setErrors(req);
    if (Object.keys(req).length) return;

    const novo = { id: "cli-" + Date.now(), ...form };
    const next = [...localList, novo];
    setLocalList(next);
    localStorage.setItem("clientes", JSON.stringify(next));

    setForm({
      nome: "",
      cnpj: "",
      responsavel: "",
      telefone: "",
      email: "",
      endereco: "",
    });
    setErrors({});
    alert("Cliente cadastrado!");
  }

  return (
    <>
      <Section
        title="Cadastro de Clientes"
        subtitle="Preencha as informações para registrar um novo cliente."
      >
        <form onSubmit={handleSubmit}>
          <div
            className="form-grid"
            style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
          >
            <Field label="Nome" error={errors.nome}>
              <input
                className="input"
                value={form.nome}
                onChange={(e) => setField("nome", e.target.value)}
              />
            </Field>
            <Field label="CNPJ" error={errors.cnpj}>
              <input
                className="input"
                value={form.cnpj}
                onChange={(e) => setField("cnpj", e.target.value)}
              />
            </Field>
            <Field label="Responsável" error={errors.responsavel}>
              <input
                className="input"
                value={form.responsavel}
                onChange={(e) => setField("responsavel", e.target.value)}
              />
            </Field>
            <Field label="Telefone" error={errors.telefone}>
              <input
                className="input"
                value={form.telefone}
                onChange={(e) => setField("telefone", e.target.value)}
              />
            </Field>
            <Field label="E-mail" error={errors.email}>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </Field>
            <Field label="Endereço" error={errors.endereco}>
              <input
                className="input"
                value={form.endereco}
                onChange={(e) => setField("endereco", e.target.value)}
              />
            </Field>
          </div>

          <div className="actions">
            <button
              type="reset"
              className="btn ghost"
              onClick={() => {
                setForm({
                  nome: "",
                  cnpj: "",
                  responsavel: "",
                  telefone: "",
                  email: "",
                  endereco: "",
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
        title="Clientes Cadastrados"
        subtitle="Base pública + registros novos."
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
            style={{ maxWidth: 340 }}
            placeholder="Filtrar por nome, responsável ou CNPJ"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
            {lista.length} cliente(s)
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CNPJ</th>
              <th>Responsável</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th>Endereço</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((c) => (
              <tr key={c.id}>
                <td>{c.nome}</td>
                <td>{c.cnpj}</td>
                <td>{c.responsavel}</td>
                <td>{c.telefone}</td>
                <td>{c.email}</td>
                <td>{c.endereco}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}
