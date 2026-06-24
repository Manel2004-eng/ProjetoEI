import { useState } from "react";
import { Link, useNavigate } from "react-router";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {
    setMessage("");

    if (!email || !password) {
      setMessage("Preenche o email e a password.");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email, password }),
})
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
  setMessage(data.error || "Erro ao efetuar login.");
  return;
}

localStorage.setItem("user", JSON.stringify(data.user));
setMessage("Login efetuado com sucesso.");

setTimeout(() => {
  navigate("/dashboard");
}, 800);
      })
      .catch((err) => {
        console.error(err);
        setMessage("Não foi possível ligar ao servidor.");
      });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Login</h1>
        <p>Entra na tua conta para aceder ao Allergy Day Planner.</p>

        <div className="auth-form">
          <label>
            Email
            <input
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="A tua password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button onClick={handleLogin}>Entrar</button>

          {message && <p className="auth-message">{message}</p>}
        </div>

        <p className="auth-switch">
          Ainda não tens conta? <Link to="/register">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;