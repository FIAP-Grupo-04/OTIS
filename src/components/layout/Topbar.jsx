import { capitalize } from "../../utils/formatters";

export default function Topbar({ user, onMenuToggle }) {
  const dateStr = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Dashboard OTIS</div>
          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: "var(--color-primary-ink)",
              fontWeight: 700,
            }}
          >
            Bem-vindo, {user?.name ?? "-"}, {user?.email ?? "-"} •{" "}
            {capitalize(user?.role ?? "")}
          </div>
        </div>
      </div>

      <div className="topbar-user">
        <span className="date">{dateStr}</span>
      </div>
    </>
  );
}
