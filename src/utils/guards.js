import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protege uma rota para usuários autenticados.
 * Exemplo:
 * <Route path="/clientes" element={<RequireAuth><Clientes/></RequireAuth>} />
 */
export function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}
