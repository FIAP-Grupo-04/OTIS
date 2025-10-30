import { useEffect, useMemo, useState } from "react";
import { getCustomerOrders } from "../services/portalService";
import { getClients } from "../services/clientsService";
import "../styles/portal.css";

export default function PortalCliente() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [codigo, setCodigo] = useState("");
  const [docInput, setDocInput] = useState(""); // CPF/CNPJ digitado
  const [buscou, setBuscou] = useState(false);

  useEffect(() => {
    Promise.all([getCustomerOrders(), getClients()])
      .then(([o, c]) => {
        setOrders(Array.isArray(o) ? o : []);
        setClients(Array.isArray(c) ? c : []);
      })
      .catch(() => {
        setOrders([]);
        setClients([]);
      });
  }, []);

  const normalizeDoc = (s = "") => String(s).replace(/\D/g, "");
  const nomeCliente = (id) => clients.find((c) => c.id === id)?.nome ?? id;
  const money = (v) =>
    Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  const dateBR = (s) => (s ? new Date(s).toLocaleDateString("pt-BR") : "-");
  const badge = (s = "") =>
    /Conclu/i.test(s)
      ? "b-green"
      : /Instala/i.test(s)
      ? "b-blue"
      : /Produ|Aguard/i.test(s)
      ? "b-yellow"
      : "b-orange";

  const resultados = useMemo(() => {
    if (!buscou) return [];
    const cod = codigo.trim().toLowerCase();
    const doc = normalizeDoc(docInput);

    return orders.filter((o) => {
      const idOk = String(o.id || "").toLowerCase() === cod;
      const docJson = normalizeDoc(o.cpf ?? o.documento ?? "");
      return idOk && docJson === doc;
    });
  }, [buscou, codigo, docInput, orders]);

  function handleBuscar(e) {
    e.preventDefault();
    if (!codigo.trim() || !docInput.trim()) {
      alert("Preencha Código do Produto e CPF/CNPJ.");
      return;
    }
    setBuscou(true);
  }

  return (
    <div className="portal-bg">
      {/* Card principal de busca */}
      <div className="portal-card">
        <div className="portal-card-brand">
          <h3>Otis</h3>
          <p>In control</p>
        </div>

        <h4 className="portal-card-title">Portal do Cliente</h4>
        <p className="portal-card-subtitle">
          Digite o código do seu produto e CPF/CNPJ para acompanhar o status do
          seu elevador Otis.
        </p>

        <form onSubmit={handleBuscar} className="portal-form" noValidate>
          <div className="field">
            <label className="label">Código do Produto</label>
            <input
              className="input"
              placeholder="Ex: ELV001"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              inputMode="latin"
              autoComplete="off"
            />
          </div>

          <div className="field">
            <label className="label">CPF / CNPJ</label>
            <input
              className="input"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              value={docInput}
              onChange={(e) => setDocInput(e.target.value)}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          <button className="btn-primary" type="submit">
            Consultar Status
          </button>
        </form>
      </div>

      {/* Resultado */}
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
