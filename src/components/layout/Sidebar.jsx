import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const isFuncionario = user?.role === "funcionario";

  return (
    <>
      <div>
        <div className="sidebar-header">Otis | In control</div>
        <nav className="sidebar-nav">
          {/* 🔒 só mostra Dashboard se não for funcionario */}
          {!isFuncionario && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Dashboard
            </NavLink>
          )}

          <NavLink
            to="/elevadores"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Produtos
          </NavLink>
          <NavLink
            to="/clientes"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Clientes
          </NavLink>
          <NavLink
            to="/operacoes"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Operações
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-footer">
        <button
          onClick={() => {
            logout();
            navigate("/");
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
