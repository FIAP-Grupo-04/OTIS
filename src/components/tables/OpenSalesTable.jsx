export default function OpenSalesTable({ items = [] }) {
  const fmt = (v) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  const badge = (status) => {
    if (/Negocia/i.test(status)) return "b-blue";
    if (/Peças|Proposta|Produ/i.test(status)) return "b-yellow";
    return "b-orange";
  };
  const fmtDate = (s) => new Date(s).toLocaleDateString("pt-BR");

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Elevador</th>
          <th>Valor</th>
          <th>Status</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        {items.map((r, i) => (
          <tr key={i}>
            <td>{r.cliente}</td>
            <td>{r.elevador}</td>
            <td>{fmt(r.valor)}</td>
            <td>
              <span className={`badge ${badge(r.status)}`}>{r.status}</span>
            </td>
            <td>{fmtDate(r.data)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
