import { useEffect, useState } from "react";
import { Link } from "react-router";

function RecordsPage() {
  const [records, setRecords] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchDiaryEntries = () => {
    setLoading(true);
    setError("");

    fetch("import.meta.env.VITE_API_URL/api/diary")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao obter registos.");
        }
        return res.json();
      })
      .then((result) => {
        const userRecords = result.filter((entry) => entry.user_id === user.id);
        setRecords(userRecords);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Não foi possível carregar os registos.");
        setLoading(false);
      });
  };

  const fetchFeedback = () => {
    setFeedbackLoading(true);

    fetch(`${import.meta.env.VITE_API_URL}/api/patients/${user.id}/feedback`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao obter feedback.");
        }
        return res.json();
      })
      .then((result) => {
        setFeedbackList(result);
        setFeedbackLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Não foi possível carregar o feedback médico.");
        setFeedbackLoading(false);
      });
  };

  useEffect(() => {
    fetchDiaryEntries();
    fetchFeedback();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

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
              <Link className="text-blue-600 border-b-2 border-blue-600 py-1" to="/records">
                Records
              </Link>
              {user?.role === "doctor" && (
                <Link className="text-slate-500 hover:text-blue-500 transition-colors py-1" to="/doctor">
                  Doctor
                </Link>
              )}
              {user?.role === "admin" && (
                <Link className="text-slate-500 hover:text-blue-500 transition-colors py-1" to="/admin">
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm text-slate-600">
              {user ? `Olá, ${user.name} (${user.role})` : ""}
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

          <div className="bg-blue-50 text-blue-700 rounded-lg mx-2 flex items-center p-3">
            <span className="mr-3">📝</span>
            <span>Records</span>
          </div>

          {user?.role === "doctor" && (
            <Link
              to="/doctor"
              className="text-slate-600 hover:bg-slate-50 rounded-lg mx-2 flex items-center p-3 transition-transform hover:translate-x-1"
            >
              <span className="mr-3">🩺</span>
              <span>Doctor</span>
            </Link>
          )}

          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="text-slate-600 hover:bg-slate-50 rounded-lg mx-2 flex items-center p-3 transition-transform hover:translate-x-1"
            >
              <span className="mr-3">⚙</span>
              <span>Admin</span>
            </Link>
          )}
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
            <h1 className="text-4xl font-bold text-slate-900">Registos</h1>
            <p className="text-slate-500 mt-2">
              Consulta o histórico dos teus registos e o feedback médico recebido.
            </p>
          </div>

          {error && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Histórico de Registos</h3>
                  <span className="text-sm text-slate-500">
                    Total: {records.length}
                  </span>
                </div>

                {loading ? (
                  <p className="text-slate-500">A carregar registos...</p>
                ) : records.length === 0 ? (
                  <p className="text-slate-500">Ainda não existem registos teus.</p>
                ) : (
                  <div className="space-y-4">
                    {records.map((entry) => (
                      <div
                        key={entry.id}
                        className="border border-slate-200 rounded-xl p-5 bg-slate-50"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-slate-900">
                              {entry.city}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {new Date(entry.date).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold w-fit">
                            Intensidade: {entry.severity}/10
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <p><strong>Espirros:</strong> {entry.sneezing || 0}/10</p>
                          <p><strong>Olhos irritados:</strong> {entry.itchy_eyes || 0}/10</p>
                          <p><strong>Congestão nasal:</strong> {entry.nasal_congestion || 0}/10</p>
                          <p><strong>Tosse:</strong> {entry.cough || 0}/10</p>
                          <p className="md:col-span-2">
                            <strong>Medicação:</strong> {entry.medication || "Nenhuma"}
                          </p>
                          <p className="md:col-span-2">
                            <strong>Observações:</strong> {entry.notes || "Sem observações."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">
                      Resumo
                    </p>
                    <h4 className="text-2xl font-bold">{records.length} registo(s)</h4>
                  </div>
                  <span className="text-4xl text-blue-200/50">📘</span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl">
                    <span className="text-sm">Utilizador</span>
                    <span className="font-bold">{user?.name || "User"}</span>
                  </div>

                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl">
                    <span className="text-sm">Role</span>
                    <span className="font-bold">{user?.role || "user"}</span>
                  </div>

                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl">
                    <span className="text-sm">Feedbacks</span>
                    <span className="font-bold">{feedbackList.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-lg font-semibold mb-4 text-slate-900">Feedback médico</h4>

                {feedbackLoading ? (
                  <p className="text-slate-500">A carregar feedback...</p>
                ) : feedbackList.length === 0 ? (
                  <p className="text-slate-500">Ainda não recebeste feedback médico.</p>
                ) : (
                  <div className="space-y-4">
                    {feedbackList.map((item) => (
                      <div
                        key={item.id}
                        className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                      >
                        <p className="text-sm text-slate-900 whitespace-pre-line">
                          {item.feedback}
                        </p>
                        <p className="text-xs text-slate-500 mt-3">
                          Médico: {item.doctor_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  📊
                </div>
                <h4 className="text-lg font-semibold mb-2 text-slate-900">Sugestão</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Consulta os teus registos e o feedback médico com frequência para perceber melhor a evolução dos sintomas.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-lg font-semibold mb-4 text-slate-900">Acesso rápido</h4>
                <div className="space-y-3">
                  <Link
                    to="/diary"
                    className="block w-full text-center text-sm font-semibold text-blue-600 border border-blue-200 rounded-xl py-3 hover:bg-blue-50"
                  >
                    Novo registo
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block w-full text-center text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl py-3 hover:bg-slate-50"
                  >
                    Voltar ao dashboard
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RecordsPage;