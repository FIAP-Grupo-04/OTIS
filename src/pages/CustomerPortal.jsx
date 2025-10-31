import { useEffect, useMemo, useState } from "react";
import { getClients } from "../services/clientsService";
import { getOperations } from "../services/operationsService";
import { getElevators } from "../services/elevatorsService";
import "../styles/portal.css";

export default function CustomerPortal() {
  const [cnpj, setCnpj] = useState("");
  const [clients, setClients] = useState([]);
  const [ops, setOps] = useState([]);
  const [elevators, setElevators] = useState([]);
  const [buscou, setBuscou] = useState(false);
  const [clienteId, setClienteId] = useState(null);

  useEffect(() => {
    // carrega "db"
    Promise.all([getClients(), getOperations(), getElevators()])
      .then(([c, o, e]) => {
        setClients(Array.isArray(c) ? c : []);
        setOps(Array.isArray(o) ? o : []);
        setElevators(Array.isArray(e) ? e : []);
      })
      .catch(() => {
        setClients([]);
        setOps([]);
        setElevators([]);
      });
  }, []);

  const onlyDigits = (s = "") => String(s).replace(/\D/g, "");
  const safeDate = (s) => {
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const dateBR = (s) => {
    const d = safeDate(s);
    return d ? d.toLocaleDateString("pt-BR") : "-";
  };
  const money = (v) =>
    Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  const badge = (s = "") =>
    /Conclu/i.test(s)
      ? "b-green"
      : /Andamento|Instala|Produ/i.test(s)
      ? "b-blue"
      : /Aguard|Peças|Proposta/i.test(s)
      ? "b-yellow"
      : "b-orange";

  const productName = (id) => elevators.find((e) => e.id === id)?.modelo || "-";

  const resultados = useMemo(() => {
    if (!buscou || !clienteId) return [];
    // filtra operações do cliente
    const meus = ops.filter((o) => o.clienteId === clienteId);

    const sorted = [...meus].sort((a, b) => {
      const da =
        safeDate(a.dataLimite) || safeDate(a.dataAbertura) || new Date(0);
      const db =
        safeDate(b.dataLimite) || safeDate(b.dataAbertura) || new Date(0);
      return db - da;
    });

    return sorted;
  }, [buscou, clienteId, ops]);

  function handleBuscar(e) {
    e.preventDefault();
    const doc = onlyDigits(cnpj);
    if (!doc) {
      alert("Informe um CPF/CNPJ válido.");
      return;
    }
    const found = clients.find((c) => onlyDigits(c.cpfCnpj) === doc);
    if (!found) {
      setClienteId(null);
      setBuscou(true);
      return;
    }
    setClienteId(found.id);
    setBuscou(true);
  }

  return (
    <div className="portal-bg">
      <div className="portal-brand">
        <h1>Otis</h1>
        <p>In control</p>
      </div>

      <h2 className="portal-title">Portal do Cliente</h2>
      <div className="portal-card">
        <h4 className="portal-card-title">Consultar pedidos</h4>
        <p className="portal-card-subtitle">
          Digite seu CNPJ para ver suas operações mais recentes.
        </p>

        <form onSubmit={handleBuscar} className="portal-form" noValidate>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="label">CNPJ</label>
            <input
              className="input"
              placeholder="00.000.000/0001-00"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          <button className="btn-primary" type="submit">
            Consultar
          </button>
        </form>
      </div>

      {buscou && (
        <div style={{ width: "100%", maxWidth: 840 }}>
          {!clienteId ? (
            <div className="portal-card">
              <b>Nenhum cliente encontrado</b> para o documento informado.
            </div>
          ) : resultados.length === 0 ? (
            <div className="portal-card">
              <b>Nenhum pedido encontrado</b> para este cliente.
            </div>
          ) : (
            <div className="portal-card">
              <h4 className="portal-card-title" style={{ marginBottom: 8 }}>
                Pedidos do Cliente
              </h4>
              <p className="portal-card-subtitle" style={{ marginTop: 0 }}>
                Do mais recente para o mais antigo
              </p>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "12px 0 0",
                  display: "grid",
                  gap: 10,
                }}
              >
                {resultados.map((o) => (
                  <li
                    key={o.id}
                    style={{
                      border: "1px solid var(--line, #e5e7eb)",
                      borderRadius: 10,
                      padding: 12,
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: 2 }}>
                          {productName(o.elevadorId)}
                        </div>
                        <div
                          style={{ fontSize: 12, color: "var(--color-muted)" }}
                        >
                          Tipo: <b>{o.tipoOperacao}</b> • Técnico:{" "}
                          <b>{o.responsavelTecnico || "-"}</b>
                        </div>
                      </div>
                      <span className={`badge ${badge(o.status)}`}>
                        {o.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 8,
                        fontSize: 13,
                      }}
                    >
                      <div>
                        <div style={{ color: "var(--color-muted)" }}>
                          Abertura
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          {dateBR(o.dataAbertura)}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: "var(--color-muted)" }}>Prazo</div>
                        <div style={{ fontWeight: 600 }}>
                          {dateBR(o.dataLimite)}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: "var(--color-muted)" }}>Valor</div>
                        <div style={{ fontWeight: 600 }}>{money(o.valor)}</div>
                      </div>
                    </div>

                    {o.descricao && (
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 13,
                          lineHeight: 1.4,
                          color: "var(--color-text)",
                        }}
                      >
                        {o.descricao}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
