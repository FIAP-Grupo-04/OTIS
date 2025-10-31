import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("/data/users.json")
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!email.trim() || !senha.trim()) {
      setErro("Preencha e-mail e senha.");
      return;
    }

    const found = users.find((u) => u.email === email && u.senha === senha);
    if (!found) {
      setErro("Usuário não encontrado. Verifique e-mail e senha.");
      return;
    }
    login(found);

    if (found.role === "funcionario") {
      navigate("/elevadores", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }

    setLoading(true);
    try {
      const found = users.find((u) => u.email === email && u.senha === senha);
      if (!found) {
        setErro("Usuário não encontrado. Verifique e-mail e senha.");
        return;
      }
      login(found);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="portal-brand">
          <h1>Otis</h1>
          <p>In control</p>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <label className="label" htmlFor="senha">
            Senha
          </label>
          <input
            id="senha"
            className="input"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
          />

          {erro && (
            <div className="error" style={{ marginTop: 6 }}>
              {erro}
            </div>
          )}

          <button
            className="btn primary"
            type="submit"
            disabled={loading}
            style={{ marginTop: 12 }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      {/* link fixo para o portal do cliente */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          fontSize: 14,
          color: "var(--color-blue, #2267f2)",
        }}
      >
        <Link
          to="/portal-cliente"
          style={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: 500,
          }}
        >
          Acessar portal do cliente
        </Link>
      </div>
    </div>
  );
}
