import { Link, useNavigate } from "react-router";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Allergy Day Planner</div>

      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/diary">Diário</Link>
        <Link to="/records">Registos</Link>
        {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        {user?.role === "doctor" && <Link to="/doctor">Doctor</Link>}
      </div>

      <div className="navbar-user">
        {user && (
          <span>
            Olá, {user.name} ({user.role})
          </span>
        )}
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;