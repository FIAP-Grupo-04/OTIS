import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppShell from "./AppShell";

// páginas
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Elevators from "./pages/Elevators";
import Operations from "./pages/Operations";
import CustomerPortal from "./pages/CustomerPortal";

function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
}

// bloqueia acesso ao Dashboard para "funcionario"
function ForbidFuncionario() {
  const { user } = useAuth();
  if (user?.role === "funcionario") {
    return <Navigate to="/elevadores" replace />;
  }
  return <Outlet />;
}

function ProtectedLayout() {
  const { user } = useAuth();
  return (
    <AppShell user={user}>
      <Outlet />
    </AppShell>
  );
}

export default function RoutesApp() {
  return (
    <Routes>
      {/* públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/portal-cliente" element={<CustomerPortal />} />

      {/* protegidas */}
      <Route element={<RequireAuth />}>
        <Route element={<ProtectedLayout />}>
          <Route element={<ForbidFuncionario />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* demais rotas liberadas para todos os logados */}
          <Route path="/clientes" element={<Clients />} />
          <Route path="/elevadores" element={<Elevators />} />
          <Route path="/operacoes" element={<Operations />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
