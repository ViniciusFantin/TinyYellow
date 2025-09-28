import { useAuthentication } from "../../hooks/useAuthentication";
import styles from "./Register.module.css";
import { useState, useEffect } from "react";

const Register = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const API_BASE = process.env.REACT_APP_API_BASE || "https://tiny-yellow-1et1.vercel.app";

    const { createUser, error: authError, loading } = useAuthentication();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

      const user = {
          displayName,
          email,
          password,
      };

    if (password !== confirmPassword) {
      setError("As senhas precisam ser iguais");
      return;
    }
    if (!displayName || !email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    const res = await createUser(user);

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao cadastrar");

      // sucesso
      setSuccess("Cadastro realizado com sucesso!");
      setDisplayName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      // opcional: esconder o alerta após alguns segundos
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {}, []);

  return (
    <div className={styles.Register}>
      <h1>Cadastre-se para postar</h1>
      <p>Crie seu usuário e compartilhe suas histórias!</p>
      <form onSubmit={handleSubmit}>
        <label>
          <span>Nome:</span>
          <input
            type="text"
            name="displayName"
            placeholder="Nome de Usuário"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>
        <label>
          <span>E-mail:</span>
          <input
            type="email"
            name="email"
            placeholder="E-mail do usuário"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          <span>Senha</span>
          <input
            type="password"
            name="password"
            placeholder="Insira sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label>
          <span>Confirme sua senha</span>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirme sua senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>

        {!loading && <button className="btn">Cadastrar</button>}
        {loading && (
          <button className="btn" disabled>
            Aguarde...
          </button>
        )}

        {error && <p className="error">{error}</p>}
          {!error && success && <p className="success">{success}</p>}
      </form>
    </div>
  );
};

export default Register;
