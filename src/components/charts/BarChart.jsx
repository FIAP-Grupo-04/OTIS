/**
 * BarChart em SVG puro (sem libs) para manter fácil de manter.
 * props: data = [{mes, valor}] OU [{label, value}], max (opcional)
 */
export default function BarChart({ data = [], height = 260, max }) {
  const pad = 28;
  const w = 720;
  const h = height;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;

  // aceita ambos formatos
  const getVal = (d) => Number(d?.valor ?? d?.value ?? 0);
  const getLbl = (d) => String(d?.mes ?? d?.label ?? "");
  const n = Array.isArray(data) ? data.length : 0;

  // evita NaN/Infinity quando não há dados
  const maxVal = Math.max(max ?? Math.max(...(n ? data.map(getVal) : [0])), 1);
  const stepX = n ? innerW / n : innerW;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
    >
      {/* linhas guia no eixo Y */}
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
        <line
          key={i}
          x1={pad}
          x2={w - pad}
          y1={pad + innerH * (1 - p)}
          y2={pad + innerH * (1 - p)}
          stroke="#e5e7eb"
          strokeDasharray="4 6"
        />
      ))}

      {/* barras */}
      {data.map((d, i) => {
        const barW = stepX * 0.5;
        const x = pad + stepX * i + (stepX - barW) / 2;
        const v = getVal(d);
        const bh = (v / maxVal) * innerH;
        const y = pad + innerH - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx="6" fill="#2267f2" />
            <text
              x={pad + stepX * i + stepX / 2}
              y={h - 6}
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
            >
              {getLbl(d)}
            </text>
          </g>
        );
      })}

      {/* eixos */}
      <line
        x1={pad}
        x2={w - pad}
        y1={pad + innerH}
        y2={pad + innerH}
        stroke="#111827"
        strokeWidth="1"
      />
      <line
        x1={pad}
        x2={pad}
        y1={pad}
        y2={pad + innerH}
        stroke="#111827"
        strokeWidth="1"
      />
    </svg>
  );
}
