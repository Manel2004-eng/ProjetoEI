import { useEffect, useState } from "react";
import { Link } from "react-router";

function DiaryPage() {
  const [selectedCity, setSelectedCity] = useState("Covilhã");

  const [diaryDate, setDiaryDate] = useState("");
  const [diaryCity, setDiaryCity] = useState("");
  const [diarySeverity, setDiarySeverity] = useState("");
  const [diarySneezing, setDiarySneezing] = useState("");
  const [diaryItchyEyes, setDiaryItchyEyes] = useState("");
  const [diaryNasalCongestion, setDiaryNasalCongestion] = useState("");
  const [diaryCough, setDiaryCough] = useState("");
  const [diaryMedication, setDiaryMedication] = useState("");
  const [diaryNotes, setDiaryNotes] = useState("");
  const [diaryMessage, setDiaryMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch("import.meta.env.VITE_API_URL/api/dashboard?city=Covilhã")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao obter cidade atual.");
        }
        return res.json();
      })
      .then((result) => {
        setSelectedCity(result.city);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    setDiaryCity(selectedCity);
  }, [selectedCity]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleSaveDiaryEntry = () => {
    setDiaryMessage("");

    if (!diaryDate || !diaryCity || diarySeverity === "") {
      setDiaryMessage("Preenche os campos obrigatórios: data, cidade e intensidade.");
      return;
    }

    const severity = Number(diarySeverity);
    const sneezing = Number(diarySneezing || 0);
    const itchyEyes = Number(diaryItchyEyes || 0);
    const nasalCongestion = Number(diaryNasalCongestion || 0);
    const cough = Number(diaryCough || 0);

    if (
      severity < 0 || severity > 10 ||
      sneezing < 0 || sneezing > 10 ||
      itchyEyes < 0 || itchyEyes > 10 ||
      nasalCongestion < 0 || nasalCongestion > 10 ||
      cough < 0 || cough > 10
    ) {
      setDiaryMessage("Os valores dos sintomas devem estar entre 0 e 10.");
      return;
    }

  const newEntry = {
  userId: user.id,
  date: diaryDate,
  city: diaryCity,
  severity,
  sneezing,
  itchyEyes,
  nasalCongestion,
  cough,
  medication: diaryMedication,
  notes: diaryNotes,
};
    fetch("import.meta.env.VITE_API_URL/api/diary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEntry),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao guardar registo.");
        }
        return res.json();
      })
      .then(() => {
        setDiaryDate("");
        setDiaryCity(selectedCity);
        setDiarySeverity("");
        setDiarySneezing("");
        setDiaryItchyEyes("");
        setDiaryNasalCongestion("");
        setDiaryCough("");
        setDiaryMedication("");
        setDiaryNotes("");
        setDiaryMessage("Registo guardado com sucesso.");
      })
      .catch((err) => {
        console.error(err);
        setDiaryMessage("Não foi possível guardar o registo.");
      });
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      {/* Top bar */}
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
              <Link className="text-blue-600 border-b-2 border-blue-600 py-1" to="/diary">
                Daily Planner
              </Link>
              <Link className="text-slate-500 hover:text-blue-500 transition-colors py-1" to="/records">
                Records
              </Link>
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

      {/* Sidebar */}
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

          <div className="bg-blue-50 text-blue-700 rounded-lg mx-2 flex items-center p-3">
            <span className="mr-3">☰</span>
            <span>Daily Planner</span>
          </div>

          <Link
            to="/records"
            className="text-slate-600 hover:bg-slate-50 rounded-lg mx-2 flex items-center p-3 transition-transform hover:translate-x-1"
          >
            <span className="mr-3">📝</span>
            <span>Records</span>
          </Link>

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

      {/* Main */}
      <main className="lg:ml-64 pt-24 px-6 pb-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900">Symptom Logger</h1>
            <p className="text-slate-500 mt-2">
              Regista os teus sintomas para acompanhar a evolução e identificar gatilhos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form side */}
            <section className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-semibold mb-6">Dados principais</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Data</label>
                    <input
                      type="date"
                      value={diaryDate}
                      onChange={(e) => setDiaryDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Cidade</label>
                    <input
                      type="text"
                      value={diaryCity}
                      onChange={(e) => setDiaryCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-semibold mb-6">Sintomas</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Intensidade geral (0 a 10)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={diarySeverity}
                      onChange={(e) => setDiarySeverity(e.target.value)}
                      placeholder="Ex: 6"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Espirros (0 a 10)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={diarySneezing}
                      onChange={(e) => setDiarySneezing(e.target.value)}
                      placeholder="Ex: 4"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Olhos irritados (0 a 10)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={diaryItchyEyes}
                      onChange={(e) => setDiaryItchyEyes(e.target.value)}
                      placeholder="Ex: 7"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Congestão nasal (0 a 10)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={diaryNasalCongestion}
                      onChange={(e) => setDiaryNasalCongestion(e.target.value)}
                      placeholder="Ex: 5"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Tosse (0 a 10)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={diaryCough}
                      onChange={(e) => setDiaryCough(e.target.value)}
                      placeholder="Ex: 3"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Medicação tomada
                    </label>
                    <input
                      type="text"
                      value={diaryMedication}
                      onChange={(e) => setDiaryMedication(e.target.value)}
                      placeholder="Ex: Anti-histamínico"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-semibold mb-4">Observações</h3>
                <textarea
                  value={diaryNotes}
                  onChange={(e) => setDiaryNotes(e.target.value)}
                  placeholder="Descreve os sintomas ou notas importantes"
                  rows="4"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSaveDiaryEntry}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
                >
                  Guardar registo
                </button>
              </div>

              {diaryMessage && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium text-blue-600">
                  {diaryMessage}
                </div>
              )}
            </section>

            {/* Right side info */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">
                      Cidade atual
                    </p>
                    <h4 className="text-2xl font-bold">{selectedCity}</h4>
                  </div>
                  <span className="text-4xl text-blue-200/50">☀</span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl">
                    <span className="text-sm">Registo diário</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20">
                      ATIVO
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl">
                    <span className="text-sm">Utilizador</span>
                    <span className="font-bold">{user?.name || "User"}</span>
                  </div>

                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl">
                    <span className="text-sm">Role</span>
                    <span className="font-bold">{user?.role || "user"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  💡
                </div>
                <h4 className="text-lg font-semibold mb-2 text-slate-900">Sugestão</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Regista os teus sintomas todos os dias à mesma hora para ser mais fácil comparar
                  a evolução com os dados ambientais e o eventual feedback médico.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-lg font-semibold mb-4 text-slate-900">Acesso rápido</h4>
                <div className="space-y-3">
                  <Link
                    to="/records"
                    className="block w-full text-center text-sm font-semibold text-blue-600 border border-blue-200 rounded-xl py-3 hover:bg-blue-50"
                  >
                    Ver histórico
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

export default DiaryPage;