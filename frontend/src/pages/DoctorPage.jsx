import { useEffect, useState } from "react";
import { Link } from "react-router";

function DoctorPage() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [patients, setPatients] = useState([]);
  const [availablePatients, setAvailablePatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [patientFeedback, setPatientFeedback] = useState([]);
  const [newFeedback, setNewFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const fetchPatients = () => {
    if (!user?.id) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/doctors/${user.id}/patients`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao obter utentes.");
        }
        return res.json();
      })
      .then((result) => {
        setPatients(result);
      })
      .catch((err) => {
        console.error(err);
        setError("Não foi possível carregar os utentes.");
      });
  };

  const fetchAvailablePatients = () => {
    fetch("import.meta.env.VITE_API_URL/api/available-patients")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao obter utentes disponíveis.");
        }
        return res.json();
      })
      .then((result) => {
        setAvailablePatients(result);
      })
      .catch((err) => {
        console.error(err);
        setError("Não foi possível carregar os utilizadores disponíveis.");
      });
  };

  const fetchPatientRecords = (patient) => {
    setRecordsLoading(true);
    setError("");

    fetch(`${import.meta.env.VITE_API_URL}/api/doctors/${user.id}/patients/${patient.id}/records`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao obter registos do utente.");
        }
        return res.json();
      })
      .then((result) => {
        setPatientRecords(result);
        setRecordsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Não foi possível carregar os registos do utente.");
        setRecordsLoading(false);
      });
  };

  const fetchPatientFeedback = (patient) => {
    setFeedbackLoading(true);
    setError("");

    fetch(`${import.meta.env.VITE_API_URL}/api/doctors/${user.id}/patients/${patient.id}/feedback`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao obter feedback do utente.");
        }
        return res.json();
      })
      .then((result) => {
        setPatientFeedback(result);
        setFeedbackLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Não foi possível carregar o feedback do utente.");
        setFeedbackLoading(false);
      });
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setNewFeedback("");
    fetchPatientRecords(patient);
    fetchPatientFeedback(patient);
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchPatients();
    fetchAvailablePatients();
    setLoading(false);
  }, []);

  const handleAddPatient = () => {
    setMessage("");
    setError("");

    if (!selectedPatientId) {
      setMessage("Escolhe um utente para associar.");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/doctors/${user.id}/patients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ patientId: Number(selectedPatientId) }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Erro ao associar utente.");
        }
        return data;
      })
      .then(() => {
        setMessage("Utente associado ao médico com sucesso.");
        setSelectedPatientId("");
        fetchPatients();
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Não foi possível associar o utente.");
      });
  };

  const handleSaveFeedback = () => {
    setMessage("");
    setError("");

    if (!selectedPatient) {
      setError("Seleciona primeiro um utente.");
      return;
    }

    if (!newFeedback.trim()) {
      setError("Escreve feedback antes de guardar.");
      return;
    }

    fetch(
      `${import.meta.env.VITE_API_URL}/api/doctors/${user.id}/patients/${selectedPatient.id}/feedback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback: newFeedback }),
      }
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Erro ao guardar feedback.");
        }
        return data;
      })
      .then(() => {
        setMessage("Feedback guardado com sucesso.");
        setNewFeedback("");
        fetchPatientFeedback(selectedPatient);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Não foi possível guardar o feedback.");
      });
  };

  const handleRemovePatient = (patientId) => {
    setMessage("");
    setError("");

    fetch(`${import.meta.env.VITE_API_URL}/api/doctors/${user.id}/patients/${patientId}`, {
      method: "DELETE",
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Erro ao remover utente.");
        }
        return data;
      })
      .then(() => {
        setMessage("Utente removido com sucesso.");
        fetchPatients();

        if (selectedPatient && selectedPatient.id === patientId) {
          setSelectedPatient(null);
          setPatientRecords([]);
          setPatientFeedback([]);
          setNewFeedback("");
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Não foi possível remover o utente.");
      });
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
              <Link
                className="text-slate-500 hover:text-blue-500 transition-colors py-1"
                to="/dashboard"
              >
                Dashboard
              </Link>
              <Link
                className="text-slate-500 hover:text-blue-500 transition-colors py-1"
                to="/diary"
              >
                Daily Planner
              </Link>
              <Link
                className="text-slate-500 hover:text-blue-500 transition-colors py-1"
                to="/records"
              >
                Records
              </Link>
              <Link
                className="text-blue-600 border-b-2 border-blue-600 py-1"
                to="/doctor"
              >
                Doctor
              </Link>
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
            <span className="text-lg font-extrabold text-blue-600">
              Health Guard
            </span>
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
            <span className="mr-3">🩺</span>
            <span>Doctor</span>
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
            <h1 className="text-4xl font-bold text-slate-900">
              Painel do Médico
            </h1>
            <p className="text-slate-500 mt-2">
              Aqui podes gerir apenas os teus próprios utentes.
            </p>
          </div>

          {message && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium text-blue-600 mb-6">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-white border border-red-200 rounded-xl p-4 text-sm font-medium text-red-600 mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Os meus utentes
                  </h2>
                  <span className="text-sm text-slate-500">
                    {patients.length} utente(s)
                  </span>
                </div>

                {loading ? (
                  <p className="text-slate-500">A carregar utentes...</p>
                ) : patients.length === 0 ? (
                  <p className="text-slate-500">
                    Ainda não tens utentes associados.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {patients.map((patient) => (
                      <div
                        key={patient.id}
                        className="border border-slate-200 rounded-xl p-5 bg-slate-50"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div
                            className="cursor-pointer flex-1"
                            onClick={() => handleSelectPatient(patient)}
                          >
                            <h3 className="text-lg font-semibold text-slate-900">
                              {patient.name}
                            </h3>
                            <p className="text-slate-500">{patient.email}</p>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleSelectPatient(patient)}
                              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                              Selecionar
                            </button>

                            <button
                              onClick={() => handleRemovePatient(patient.id)}
                              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedPatient
                      ? `Registos de ${selectedPatient.name}`
                      : "Registos do utente"}
                  </h2>
                </div>

                {!selectedPatient ? (
                  <p className="text-slate-500">
                    Seleciona um utente para veres os respetivos registos.
                  </p>
                ) : recordsLoading ? (
                  <p className="text-slate-500">A carregar registos...</p>
                ) : patientRecords.length === 0 ? (
                  <p className="text-slate-500">
                    Este utente ainda não tem registos.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {patientRecords.map((record) => (
                      <div
                        key={record.id}
                        className="border border-slate-200 rounded-xl p-5 bg-slate-50"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {record.city}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {new Date(record.date).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold w-fit">
                            Intensidade: {record.severity}/10
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <p>
                            <strong>Espirros:</strong> {record.sneezing || 0}/10
                          </p>
                          <p>
                            <strong>Olhos irritados:</strong>{" "}
                            {record.itchy_eyes || 0}/10
                          </p>
                          <p>
                            <strong>Congestão nasal:</strong>{" "}
                            {record.nasal_congestion || 0}/10
                          </p>
                          <p>
                            <strong>Tosse:</strong> {record.cough || 0}/10
                          </p>
                          <p className="md:col-span-2">
                            <strong>Medicação:</strong>{" "}
                            {record.medication || "Nenhuma"}
                          </p>
                          <p className="md:col-span-2">
                            <strong>Observações:</strong>{" "}
                            {record.notes || "Sem observações."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedPatient
                      ? `Feedback para ${selectedPatient.name}`
                      : "Feedback médico"}
                  </h2>
                </div>

                {!selectedPatient ? (
                  <p className="text-slate-500">
                    Seleciona um utente para veres ou escreveres feedback.
                  </p>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Novo feedback
                      </label>
                      <textarea
                        value={newFeedback}
                        onChange={(e) => setNewFeedback(e.target.value)}
                        rows="4"
                        placeholder="Escreve aqui as observações, recomendações ou aconselhamento clínico."
                        className="w-full rounded-xl border border-slate-300 px-4 py-3"
                      ></textarea>

                      <button
                        onClick={handleSaveFeedback}
                        className="mt-4 bg-blue-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                      >
                        Guardar feedback
                      </button>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        Feedback anterior
                      </h3>

                      {feedbackLoading ? (
                        <p className="text-slate-500">A carregar feedback...</p>
                      ) : patientFeedback.length === 0 ? (
                        <p className="text-slate-500">
                          Ainda não existe feedback para este utente.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {patientFeedback.map((item) => (
                            <div
                              key={item.id}
                              className="border border-slate-200 rounded-xl p-5 bg-slate-50"
                            >
                              <p className="text-sm text-slate-900 whitespace-pre-line">
                                {item.feedback}
                              </p>
                              <p className="text-xs text-slate-500 mt-3">
                                {new Date(item.created_at).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">
                      Médico autenticado
                    </p>
                    <h4 className="text-2xl font-bold">
                      {user?.name || "Doctor"}
                    </h4>
                  </div>
                  <span className="text-4xl text-blue-200/50">🩺</span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl">
                    <span className="text-sm">Email</span>
                    <span className="font-bold text-right">
                      {user?.email || "-"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl">
                    <span className="text-sm">Role</span>
                    <span className="font-bold">{user?.role || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-lg font-semibold mb-4 text-slate-900">
                  Adicionar utente
                </h4>

                <div className="space-y-4">
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  >
                    <option value="">Escolher utente</option>
                    {availablePatients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} - {patient.email}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleAddPatient}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    Associar utente
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-lg font-semibold mb-4 text-slate-900">
                  Resumo
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Nesta área tens acesso apenas aos teus próprios utentes, aos
                  registos deles e ao feedback que fores deixando.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DoctorPage;