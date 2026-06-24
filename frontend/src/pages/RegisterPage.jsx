import { useState } from "react";
import { Link, useNavigate } from "react-router";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [wantsDoctor, setWantsDoctor] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = () => {
    setMessage("");

    if (!name || !email || !password || !confirmPassword) {
      setMessage("Preenche todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("As passwords não coincidem.");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, wantsDoctor }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setMessage(data.error || "Erro ao registar utilizador.");
          return;
        }

        if (wantsDoctor) {
          setMessage("Conta criada. O pedido de acesso como médico ficou pendente de aprovação do admin.");
        } else {
          setMessage("Conta criada com sucesso.");
        }

        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setWantsDoctor(false);

        setTimeout(() => {
          navigate("/");
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
        setMessage("Não foi possível ligar ao servidor.");
      });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Registo</h1>
        <p>Cria a tua conta para começar a usar o Allergy Day Planner.</p>

        <div className="auth-form">
          <label>
            Nome
            <input
              type="text"
              placeholder="O teu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

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
              placeholder="Cria uma password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <label>
            Confirmar password
            <input
              type="password"
              placeholder="Repete a password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>

          <label className="flex items-center gap-3 !flex-row font-normal">
            <input
              type="checkbox"
              checked={wantsDoctor}
              onChange={(e) => setWantsDoctor(e.target.checked)}
            />
            <span>Solicitar acesso como médico</span>
          </label>

          <button onClick={handleRegister}>Criar conta</button>

          {message && <p className="auth-message">{message}</p>}
        </div>

        <p className="auth-switch">
          Já tens conta? <Link to="/">Entrar</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;