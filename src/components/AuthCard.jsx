import { useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";

export default function AuthCard({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!email.trim()) e.email = "Informe seu e-mail.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "E-mail inválido.";
    if (!senha) e.senha = "Informe sua senha.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 500)); // simulação
      onSubmit?.({ email, senha });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-head">
        <h1 className="brand-title">ElevadorPro</h1>
        <p className="brand-subtitle">Sistema de Gerenciamento de Vendas</p>
      </div>

      <form onSubmit={handleSubmit} className="form" noValidate>
        <label className="label" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          hasError={!!errors.email}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <label className="label" htmlFor="senha">
          Senha
        </label>
        <Input
          id="senha"
          type="password"
          placeholder="••••••••"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          hasError={!!errors.senha}
        />
        {errors.senha && <p className="error">{errors.senha}</p>}

        <Button type="submit" loading={loading}>
          Entrar
        </Button>
      </form>
    </div>
  );
}
