import { useEffect, useMemo, useState } from "react";
import { getCustomerOrders } from "../services/portalService";
import { getClients } from "../services/clientsService";
import "../styles/portal.css";

export default function CustomerPortal() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [codigo, setCodigo] = useState("");
  const [cpf, setCpf] = useState("");
  const [buscou, setBuscou] = useState(false);

  useEffect(() => {
    Promise.all([getCustomerOrders(), getClients()])
      .then(([o, c]) => {
        setOrders(o || []);
        setClients(c || []);
      })
      .catch(() => {});
  }, []);

  const resultados = useMemo(() => {
    if (!buscou) return [];
    const cod = codigo.trim().toLowerCase();
    const doc = cpf.replace(/\D/g, "");
    return orders.filter(
      (o) =>
        o.id.toLowerCase() === cod &&
        (o.cpf?.replace(/\D/g, "") === doc ||
          o.documento?.replace(/\D/g, "") === doc)
    );
  }, [buscou, codigo, cpf, orders]);

  const nomeCliente = (id) => clients.find((c) => c.id === id)?.nome ?? id;
  const money = (v) =>
    Number(v).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  const dateBR = (s) => (s ? new Date(s).toLocaleDateString("pt-BR") : "-");
  const badge = (s) =>
    /Conclu/i.test(s)
      ? "b-green"
      : /Instala/i.test(s)
      ? "b-blue"
      : /Produ|Aguard/i.test(s)
      ? "b-yellow"
      : "b-orange";

  function handleBuscar(e) {
    e.preventDefault();
    if (!codigo.trim() || !cpf.trim())
      return alert("Preencha Código do Produto e CPF.");
    setBuscou(true);
  }

  return (
    <div className="portal-bg">
      <div className="portal-brand">
        <h1>Otis</h1>
        <p>In control</p>
      </div>

      <h2 className="portal-title">Portal do Cliente</h2>
      <p className="portal-subtitle">Acompanhe o status do seu elevador</p>

      {/* Card principal */}
      <div className="portal-card">
        <div className="portal-card-brand">
          <h3>Otis</h3>
          <p>In control</p>
        </div>
        <h4 className="portal-card-title">Portal do Cliente</h4>
        <p className="portal-card-subtitle">
          Digite o código do seu produto e CPF para acompanhar o status do seu
          elevador Otis
        </p>

        <form onSubmit={handleBuscar} className="portal-form" noValidate>
          <div className="field">
            <label className="label">Código do Produto</label>
            <input
              className="input"
              placeholder="Ex: ELV001"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="label">CPF</label>
            <input
              className="input"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />
          </div>
          <button className="btn-primary" type="submit">
            Consultar Status
          </button>
        </form>
      </div>

      {/* Card de exemplos */}
      <div className="portal-card">
        <div className="help-icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path
              d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z"
              fill="#2267f2"
              opacity="0.15"
            />
            <path
              d="M12 3v18M3 7.5l9 4.5m9-4.5-9 4.5"
              stroke="#2267f2"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>
        <h4 className="portal-card-title">Acompanhe seu Elevador Otis</h4>
        <p className="portal-card-subtitle">
          Digite o código do produto e seu CPF acima para acompanhar o status
          completo do seu elevador.
        </p>
        <div className="examples">
          <div className="examples-title">Exemplos de códigos:</div>
          <ul>
            <li>ELV001 — CPF: 123.456.789-01</li>
            <li>ELV002 — CPF: 987.654.321-00</li>
          </ul>
        </div>
      </div>

      {/* Resultado da busca */}
      {buscou && (
        <div style={{ width: "100%", maxWidth: 840 }}>
          {resultados.length === 0 ? (
            <div className="portal-card">
              <b>Nenhum pedido encontrado</b> para os dados informados.
            </div>
          ) : (
            resultados.map((o) => (
              <div key={o.id} className="portal-card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 4px" }}>
                      {o.id} — {o.produto}
                    </h3>
                    <p className="portal-card-subtitle" style={{ margin: 0 }}>
                      Cliente: <b>{nomeCliente(o.clienteId)}</b> • Valor:{" "}
                      <b>{money(o.valor)}</b>
                    </p>
                  </div>
                  <span className={`badge ${badge(o.situacaoAtual)}`}>
                    {o.situacaoAtual}
                  </span>
                </div>

                <div className="divider" />

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "grid",
                    gap: 10,
                  }}
                >
                  {o.historico?.map((h, i) => (
                    <li
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "120px 1fr",
                        gap: 12,
                        alignItems: "start",
                      }}
                    >
                      <div
                        style={{ fontSize: 12, color: "var(--color-muted)" }}
                      >
                        {dateBR(h.data)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{h.status}</div>
                        {h.descricao && (
                          <div style={{ fontSize: 14 }}>{h.descricao}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    color: "var(--color-muted)",
                  }}
                >
                  Última atualização em {dateBR(o.atualizadoEm)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
