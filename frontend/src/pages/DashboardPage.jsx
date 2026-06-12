import { useEffect, useState } from "react";
import { Link } from "react-router";

function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [location, setLocation] = useState("Localização não obtida.");
  const [coords, setCoords] = useState(null);
  const [manualCity, setManualCity] = useState("");
  const [selectedCity, setSelectedCity] = useState("Covilhã");

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchDashboard = (city = "Covilhã") => {
    setLoading(true);
    setError("");

    fetch(`http://localhost:5000/api/dashboard?city=${encodeURIComponent(city)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao obter dados do dashboard.");
        }
        return res.json();
      })
      .then((result) => {
        setData(result);
        setSelectedCity(result.city);
        setCoords({
          lat: Number(result.latitude).toFixed(5),
          lon: Number(result.longitude).toFixed(5),
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Não foi possível carregar os dados.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard("Covilhã");
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocation("Geolocalização não suportada neste dispositivo.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(5);
        const lon = position.coords.longitude.toFixed(5);

        setCoords({ lat, lon });
        setLocation("Localização obtida com sucesso.");
      },
      () => {
        setLocation("Não foi possível obter a localização.");
      }
    );
  };

  const handleManualCity = () => {
    const city = manualCity.trim();

    if (!city) {
      setLocation("Escreve uma cidade primeiro.");
      return;
    }

    setLocation(`Cidade manual definida: ${city}`);
    setManualCity("");
    fetchDashboard(city);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <p>A carregar dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

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
    <Link className="text-blue-600 border-b-2 border-blue-600 py-1" to="/dashboard">
      Dashboard
    </Link>
    <Link className="text-slate-500 hover:text-blue-500 transition-colors py-1" to="/diary">
      Daily Planner
    </Link>
    <Link className="text-slate-500 hover:text-blue-500 transition-colors py-1" to="/records">
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
  <div className="bg-blue-50 text-blue-700 rounded-lg mx-2 flex items-center p-3">
    <span className="mr-3">▣</span>
    <span>Dashboard</span>
  </div>

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

      {/* Main */}
      <main className="lg:ml-64 pt-24 pb-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Good Morning, {user?.name || "User"}
              </h1>
              <p className="text-slate-500 mt-1">
                Here is your personalized allergy forecast for {selectedCity} today.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/diary"
                className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 shadow-lg shadow-blue-200"
              >
                <span>＋</span>
                Log Symptoms
              </Link>
            </div>
          </div>

          {/* Location selector */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
            <h3 className="text-xl font-semibold mb-4">Location</h3>

            <div className="flex flex-col gap-4">
              <p className="text-slate-700">
                <strong>Current city:</strong> {selectedCity}
              </p>
              {data?.country && (
                <p className="text-slate-500">
                  Country: {data.country} | Timezone: {data.timezone}
                </p>
              )}

              <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={getLocation}
                  className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200"
                >
                  Use my location
                </button>

                <input
                  type="text"
                  placeholder="Type your city"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-slate-300 w-full md:w-72"
                />

                <button
                  onClick={handleManualCity}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Use city
                </button>
              </div>

              <p className="text-sm text-slate-500">{location}</p>

              {coords && (
                <p className="text-sm text-slate-500">
                  Latitude: {coords.lat} | Longitude: {coords.lon}
                </p>
              )}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main risk block */}
            <div className="md:col-span-8 bg-blue-50 rounded-xl p-6 relative overflow-hidden">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-blue-600">🌿</span>
                  <span className="text-blue-600 tracking-widest uppercase text-xs font-semibold">
                    Daily Allergy Risk
                  </span>
                </div>

                <div className="flex flex-wrap items-end gap-8 mb-8">
                  <div className="flex flex-col">
                    <span className="text-[64px] font-extrabold text-slate-900 leading-none">
                      {data.airQuality.aqi}
                    </span>
                    <span className="text-slate-500 text-sm">European AQI</span>
                  </div>

                  <div className="flex flex-col pb-2">
                    <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-xl font-semibold flex items-center gap-2">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      {data.riskLevel}
                    </span>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-3 gap-4 border-t border-blue-100 pt-6">
                  <div>
                    <p className="text-slate-500 text-xs mb-1 uppercase font-semibold">Weather</p>
                    <p className="font-semibold text-slate-900">{data.weather.temperature}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1 uppercase font-semibold">Air</p>
                    <p className="font-semibold text-slate-900">{data.airQuality.status}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1 uppercase font-semibold">Pollen</p>
                    <p className="font-semibold text-slate-900">{data.pollen.level}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Triggers */}
            <div className="md:col-span-4 bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Triggers</h3>
                <span className="text-slate-400">☰</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600">💨</span>
                    <span className="font-medium">AQI: {data.airQuality.aqi}</span>
                  </div>
                  <span className="text-green-600">●</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600">💧</span>
                    <span className="font-medium">Humidity: {data.weather.humidity}</span>
                  </div>
                  <span className="text-slate-400">i</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                  <div className="flex items-center gap-3">
                    <span className="text-red-500">🌡</span>
                    <span className="font-medium text-red-700">
                      Temp: {data.weather.temperature}
                    </span>
                  </div>
                  <span className="text-red-500">!</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600">🌬</span>
                    <span className="font-medium">Wind: {data.weather.wind}</span>
                  </div>
                  <span className="text-slate-400">↗</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="md:col-span-7 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                  <h3 className="text-xl font-semibold">Today’s Recommendations</h3>
                  <p className="text-slate-500 text-sm">Based on current environmental conditions</p>
                </div>
                <span className="text-blue-600 text-3xl">💊</span>
              </div>

              <div className="space-y-4">
                {data.recommendations.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health streak / summary */}
            <div className="md:col-span-5 bg-green-50 rounded-xl p-6 border border-green-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-green-600">✨</span>
                  <h3 className="text-xl font-semibold text-slate-900">Environmental Summary</h3>
                </div>

                <p className="text-slate-700 mb-6">
                  Current dominant pollen: <strong>{data.pollen.dominant}</strong>. Air quality is{" "}
                  <strong>{data.airQuality.status}</strong> and the calculated daily risk is{" "}
                  <strong>{data.riskLevel}</strong>.
                </p>

                <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-green-500 w-[70%] rounded-full"></div>
                </div>

                <div className="flex justify-between text-xs font-bold text-green-700">
                  <span>Status today</span>
                  <span>{data.riskLevel}</span>
                </div>
              </div>

              <div className="mt-6 bg-white/70 rounded-lg p-4">
                <p className="text-sm text-slate-600">
                  Keep tracking your symptoms in the Daily Planner to compare how you feel with the
                  environmental data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto border-t border-slate-200 bg-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2024 Allergy Day Planner. Medical data encrypted.</p>
          <div className="flex gap-6">
            <a className="hover:text-blue-500 hover:underline underline-offset-4 transition-all" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-blue-500 hover:underline underline-offset-4 transition-all" href="#">
              Terms of Service
            </a>
            <a className="hover:text-blue-500 hover:underline underline-offset-4 transition-all" href="#">
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DashboardPage;