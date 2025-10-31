export default function DonutChart({ data = [], size = 240, hole = 80 }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const r = size / 2;
  const ri = hole / 2;
  let start = 0;

  const segs = data.map((d, i) => {
    const angle = (d.value / total) * Math.PI * 2;
    const end = start + angle;
    const large = angle > Math.PI ? 1 : 0;

    const p0 = polar(r, r, r - 4, start);
    const p1 = polar(r, r, r - 4, end);
    const p2 = polar(r, r, ri, end);
    const p3 = polar(r, r, ri, start);

    const dPath = [
      `M ${p0.x} ${p0.y}`,
      `A ${r - 4} ${r - 4} 0 ${large} 1 ${p1.x} ${p1.y}`,
      `L ${p2.x} ${p2.y}`,
      `A ${ri} ${ri} 0 ${large} 0 ${p3.x} ${p3.y}`,
      "Z",
    ].join(" ");

    start = end;
    return { dPath, color: d.color, label: d.label, value: d.value, i };
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 12,
        alignItems: "center",
      }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        height={size}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block" }}
      >
        {segs.map((s) => (
          <path key={s.i} d={s.dPath} fill={s.color} />
        ))}
      </svg>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, fontSize: 14 }}>
        {data.map((d, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                display: "inline-block",
                borderRadius: 999,
                background: d.color,
              }}
            />
            {d.label} <b style={{ marginLeft: 6 }}>{d.value}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

function polar(cx, cy, r, ang) {
  return { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
}
