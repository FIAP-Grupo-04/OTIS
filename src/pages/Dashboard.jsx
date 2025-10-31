import { useEffect, useState } from "react";
import { money } from "../utils/formatters";

import Card from "../components/ui/Card";
import BarChart from "../components/charts/BarChart";
import DonutChart from "../components/charts/DonutChart";
import OpenSalesTable from "../components/tables/OpenSalesTable";

import {
  getSalesSummary,
  getSalesByStatus,
  getOpenSales,
  onOperationsChange,
} from "../services/operationsService";
import { getClients } from "../services/clientsService";
import { getElevators } from "../services/elevatorsService";

const dateBRsafe = (s) => {
  if (!s) return "";
  const d = new Date(s);
  const ok = !Number.isNaN(d.getTime());
  return ok ? d.toLocaleDateString("pt-BR") : "";
};

function last6MonthsStatic() {
  const now = new Date();
  const arr = [];
  for (let i = 6; i >= 1; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const valor = 4 + (d.getMonth() % 6) * 2;
    arr.push({ mes, valor });
  }
  return arr;
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [months, setMonths] = useState([]);
  const [status, setStatus] = useState(null);
  const [openSales, setOpenSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [elevators, setElevators] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [sum, byStatus, open, cli, evs] = await Promise.all([
        getSalesSummary(),
        getSalesByStatus(),
        getOpenSales(),
        getClients(),
        getElevators(),
      ]);

      setSummary({
        totalVendas: { valor: Number(sum.total || 0), delta: sum.deltas.total },
        faturamento: {
          valor: Number(sum.faturamento || 0),
          delta: sum.deltas.faturamento,
        },
        vendasPendentes: {
          valor: Number(sum.pendentes || 0),
          delta: sum.deltas.pendentes,
        },
        modeloMais: { nome: sum.modeloMais, delta: sum.deltas.modelo },
      });

      setMonths(last6MonthsStatic());

      setStatus({
        negociacao: Number(byStatus["Em Negociação"] || 0),
        preparacao: Number(byStatus["Aguardando Peças"] || 0),
        integracao: Number(byStatus["Em Andamento"] || 0),
        concluido: Number(byStatus["Concluída"] || 0),
      });

      const nameOfClient = (id) =>
        (cli || []).find((c) => c.id === id)?.nome || id;
      const nameOfProduct = (id) =>
        (evs || []).find((e) => e.id === id)?.modelo || id;

      const openMapped = (open || []).map((o) => ({
        cliente: nameOfClient(o.clienteId),
        elevador: nameOfProduct(o.elevadorId),
        status: o.status || "—",
        valor: Number(o.valor || 0),
        prazo: dateBRsafe(o.dataLimite) || "",
      }));
      setOpenSales(openMapped);

      setClients(cli || []);
      setElevators(evs || []);
    };

    load();
    const unsub = onOperationsChange(load);
    return unsub;
  }, []);

  if (!summary || !status) return <>Carregando…</>;

  return (
    <>
      {/* cards */}
      <div
        className="cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <Card title="Total de Operações">
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

        <Card title="Operações Pendentes">
          <div className="card-value">{summary.vendasPendentes.valor}</div>
          <div className="delta">
            ↘ {summary.vendasPendentes.delta}% do mês passado
          </div>
        </Card>

        <Card title="Modelo mais recorrente">
          <div className="card-value" style={{ color: "var(--color-orange)" }}>
            {summary.modeloMais.nome || "—"}
          </div>
          <div className="delta">
            ↗ +{summary.modeloMais.delta}% do mês passado
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
          <h3 style={{ margin: "0 0 6px" }}>Operações por Mês</h3>
          <p className="subtitle" style={{ marginTop: 0 }}>
            Quantidade de operações realizadas nos últimos meses
          </p>
          <BarChart data={months} />
        </div>

        <div className="panel">
          <h3 style={{ margin: "0 0 6px" }}>Status das Operações</h3>
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
        <h3 style={{ margin: "0 0 6px" }}>Operações Não Concluídas</h3>
        <p className="subtitle" style={{ marginTop: 0 }}>
          Operações que precisam de acompanhamento
        </p>
        <OpenSalesTable items={openSales} />
      </div>
    </>
  );
}
