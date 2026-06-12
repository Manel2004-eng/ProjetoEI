import { useEffect, useState } from "react";
import { Link } from "react-router";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchUsers = () => {
    setLoading(true);
    setError("");

    fetch("http://localhost:5000/api/users")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao obter utilizadores.");
        }
        return res.json();
      })
      .then((result) => {
        setUsers(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Não foi possível carregar os utilizadores.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleApproveDoctor = (userId) => {
    setMessage("");

    fetch(`http://localhost:5000/api/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "doctor", doctorRequest: false }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao aprovar pedido.");
        }
        return res.json();
      })
      .then(() => {
        setMessage("Pedido de médico aprovado com sucesso.");
        fetchUsers();
      })
      .catch((err) => {
        console.error(err);
        setMessage("Não foi possível aprovar o pedido.");
      });
  };

  const handleRejectDoctor = (userId) => {
    setMessage("");

    fetch(`http://localhost:5000/api/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "user", doctorRequest: false }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao rejeitar pedido.");
        }
        return res.json();
      })
      .then(() => {
        setMessage("Pedido de médico rejeitado.");
        fetchUsers();
      })
      .catch((err) => {
        console.error(err);
        setMessage("Não foi possível rejeitar o pedido.");
      });
  };

  const pendingDoctorRequests = users.filter(
    (user) => user.role === "user" && user.doctor_request === true
  );

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex justify-between items-center h-16 px-6 max-w-[1200px] mx-auto w-full">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-blue-600">
              Allergy Day Planner
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex gap-6">
              <Link className="text-slate-500 hover:text-blue-500 transition-colors py-1" to="/dashboard">
                Dashboard
              </Link>
              <Link className="text-slate-500 hover:text-blue-500 transition-colors py-1" to="/diary">
                Daily Planner
              </Link>
              <Link className="text-slate-500 hover:text-blue-500 transition-colors py-1" to="/records">
                Records
              </Link>
              <Link className="text-blue-600 border-b-2 border-blue-600 py-1" to="/admin">
                Admin
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm text-slate-600">
              {currentUser ? `Olá, ${currentUser.name} (${currentUser.role})` : ""}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <aside className="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r border-slate-100 bg-white flex-col py-6 space-y-2 shadow-[4px_0_24px_rgba(59,130,246,0.05)] text-sm">
        <div className="px-6 mb-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-blue-600 text-2xl">✚</span>
            <span className="text-lg font-extrabold text-blue-600">Health Guard</span>
          </div>
          <p className="text-xs text-slate-500">Managing your environment</p>
        </div>

        <nav className="flex-1 space-y-1">
          <Link
            to="/dashboard"
            className="text-slate-600 hover:bg-slate-50 rounded-lg mx-2 flex items-center p-3 transition-transform hover:translate-x-1"
          >
            <span className="mr-3">▣</span>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/diary"
            className="text-slate-600 hover:bg-slate-50 rounded-lg mx-2 flex items-center p-3 transition-transform hover:translate-x-1"
          >
            <span className="mr-3">☰</span>
            <span>Daily Planner</span>
          </Link>

          <Link
            to="/records"
            className="text-slate-600 hover:bg-slate-50 rounded-lg mx-2 flex items-center p-3 transition-transform hover:translate-x-1"
          >
            <span className="mr-3">📝</span>
            <span>Records</span>
          </Link>

          <div className="bg-blue-50 text-blue-700 rounded-lg mx-2 flex items-center p-3">
            <span className="mr-3">⚙</span>
            <span>Admin</span>
          </div>
        </nav>

        <div className="px-4 py-4">
          <button className="w-full bg-red-500 text-white py-3 rounded-xl font-medium shadow-lg shadow-red-200">
            Emergency Kit
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 pt-24 px-6 pb-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900">Painel de Administração</h1>
            <p className="text-slate-500 mt-2">
              Gerir utilizadores, permissões e pedidos de acesso a médico.
            </p>
          </div>

          {message && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium text-blue-600 mb-6">
              {message}
            </div>
          )}

          {loading && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <p>A carregar utilizadores...</p>
            </div>
          )}

          {error && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-8">
              {/* Pedidos pendentes */}
              <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Pedidos de acesso a médico
                  </h2>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">
                    {pendingDoctorRequests.length} pendente(s)
                  </span>
                </div>

                {pendingDoctorRequests.length === 0 ? (
                  <p className="text-slate-500">Não existem pedidos pendentes neste momento.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingDoctorRequests.map((user) => (
                      <div
                        key={user.id}
                        className="border border-amber-200 bg-amber-50 rounded-xl p-5"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{user.name}</h3>
                            <p className="text-slate-500">{user.email}</p>
                            <p className="text-sm text-slate-400 mt-1">
                              Pedido feito por conta com role atual: {user.role}
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={() => handleApproveDoctor(user.id)}
                              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                            >
                              Aprovar médico
                            </button>

                            <button
                              onClick={() => handleRejectDoctor(user.id)}
                              className="px-4 py-2 rounded-lg bg-slate-600 text-white hover:bg-slate-700 transition-colors"
                            >
                              Rejeitar pedido
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Lista geral */}
              <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Todos os utilizadores</h2>
                  <span className="text-sm text-slate-500">Total: {users.length}</span>
                </div>

                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="border border-slate-200 rounded-xl p-5 bg-slate-50"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{user.name}</h3>
                          <p className="text-slate-500">{user.email}</p>
                          <p className="text-sm text-slate-400 mt-1">
                            Criado em: {new Date(user.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
    {user.role}
  </span>

  {user.doctor_request && (
    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">
      Pedido médico pendente
    </span>
  )}

  {user.role === "user" && !user.doctor_request && (
    <button
      onClick={() => handleApproveDoctor(user.id)}
      className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
    >
      Promover a médico
    </button>
  )}

  {user.role === "doctor" && (
    <button
      onClick={() => handleRejectDoctor(user.id)}
      className="px-4 py-2 rounded-lg bg-slate-600 text-white hover:bg-slate-700 transition-colors"
    >
      Voltar a user
    </button>
  )}
</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminPage;