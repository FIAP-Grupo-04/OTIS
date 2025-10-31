export default function OpenSalesTable({ items = [] }) {
  const fmtBRL = (v) =>
    Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });

  const badge = (status = "") => {
    if (/Conclu/i.test(status)) return "b-green";
    if (/Andamento|Instala|Produ/i.test(status)) return "b-blue";
    if (/Peças|Proposta|Aguard/i.test(status)) return "b-yellow";
    return "b-orange";
  };

  const safeDate = (s) => {
    if (!s) return "-";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("pt-BR");
  };

  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Produto</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Prazo</th>
          </tr>
        </thead>

        <tbody>
          {items.map((r, i) => (
            <tr key={i}>
              <td>{r.cliente}</td>
              <td>{r.elevador}</td>
              <td>{fmtBRL(r.valor)}</td>
              <td>
                <span className={`badge ${badge(r.status)}`}>{r.status}</span>
              </td>
              <td>{safeDate(r.prazo ?? r.dataLimite ?? r.data)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
