import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ onItemClick }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isFuncionario = user?.role === "funcionario";

  const close = () => onItemClick?.();

  return (
    <>
      <div className="sidebar-header">Otis | In control</div>
      <nav className="sidebar-nav">
        {!isFuncionario && (
          <NavLink
            to="/dashboard"
            onClick={close}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>
        )}
        <NavLink
          to="/elevadores"
          onClick={close}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Produtos
        </NavLink>
        <NavLink
          to="/clientes"
          onClick={close}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Clientes
        </NavLink>
        <NavLink
          to="/operacoes"
          onClick={close}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Operações
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={() => {
            logout();
            navigate("/");
            close();
          }}
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            color: "#ef4444",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </div>
    </>
  );
}
