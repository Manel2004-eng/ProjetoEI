import "./App.css";
import { Routes, Route } from "react-router";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import DiaryPage from "./pages/DiaryPage";
import RecordsPage from "./pages/RecordsPage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DoctorPage from "./pages/DoctorPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diary"
        element={
          <ProtectedRoute>
            <DiaryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/records"
        element={
          <ProtectedRoute>
            <RecordsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
  path="/doctor"
  element={
    <ProtectedRoute>
      <DoctorPage />
    </ProtectedRoute>
  }
/>
    </Routes>
  );
}

export default App;