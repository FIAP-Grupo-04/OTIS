import { useEffect, useState } from "react";
import { money } from "../utils/formatters";
import {
  getSalesSummary,
  getSalesByMonth,
  getSalesStatus,
  getSalesOpen,
} from "../services/salesService";
import Card from "../components/ui/Card";
import BarChart from "../components/charts/BarChart";
import DonutChart from "../components/charts/DonutChart";
import OpenSalesTable from "../components/tables/OpenSalesTable";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [months, setMonths] = useState([]);
  const [status, setStatus] = useState(null);
  const [openSales, setOpenSales] = useState([]);

  useEffect(() => {
    Promise.all([
      getSalesSummary(),
      getSalesByMonth(),
      getSalesStatus(),
      getSalesOpen(),
    ])
      .then(([sum, mon, st, open]) => {
        setSummary(sum);
        setMonths(mon.serie || []);
        setStatus(st);
        setOpenSales(open.items || []);
      })
      .catch((e) => {
        console.error("Erro ao carregar dados do dashboard:", e);
        alert("Erro ao carregar dados do dashboard.");
      });
  }, []);

  if (!summary || !status) return <>Carregando…</>;

  return (
    <>
      {/* cards de resumo */}
      <div
        className="cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <Card title="Total de Vendas">
          <div className="card-value">{summary.totalVendas.valor}</div>
          <div className="delta">
            ↗ +{summary.totalVendas.delta}% do mês passado
          </div>
        </Card>

        <Card title="Faturamento">
          <div className="card-value" style={{ color: "var(--color-green)" }}>
            {money(summary.faturamento.valor)}
          </div>
          <div className="delta">
            ↗ +{summary.faturamento.delta}% do mês passado
          </div>
        </Card>

        <Card title="Vendas Pendentes">
          <div className="card-value">{summary.vendasPendentes.valor}</div>
          <div className="delta">
            ↘ {summary.vendasPendentes.delta}% do mês passado
          </div>
        </Card>

        <Card title="Valor Pendente">
          <div className="card-value" style={{ color: "var(--color-orange)" }}>
            {money(summary.valorPendente.valor)}
          </div>
          <div className="delta">
            ↗ +{summary.valorPendente.delta}% do mês passado
          </div>
        </Card>
      </div>

      {/* gráficos */}
      <div
        className="grid"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <div className="panel">
          <h3 style={{ margin: "0 0 6px" }}>Vendas por Mês</h3>
          <p className="subtitle" style={{ marginTop: 0 }}>
            Número de vendas realizadas nos últimos 6 meses
          </p>
          <BarChart data={months} />
        </div>

        <div className="panel">
          <h3 style={{ margin: "0 0 6px" }}>Status das Vendas</h3>
          <p className="subtitle" style={{ marginTop: 0 }}>
            Distribuição por status atual
          </p>
          <DonutChart
            data={[
              {
                label: "Negociação",
                value: status.negociacao,
                color: "#2267f2",
              },
              {
                label: "Preparação",
                value: status.preparacao,
                color: "#f59e0b",
              },
              {
                label: "Integração",
                value: status.integracao,
                color: "#f97316",
              },
              { label: "Concluído", value: status.concluido, color: "#10b981" },
            ]}
          />
        </div>
      </div>

      {/* tabela */}
      <div className="panel">
        <h3 style={{ margin: "0 0 6px" }}>Vendas Não Concluídas</h3>
        <p className="subtitle" style={{ marginTop: 0 }}>
          Vendas que precisam de acompanhamento
        </p>
        <OpenSalesTable items={openSales} />
      </div>
    </>
  );
}
