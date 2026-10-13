import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <Link to="/" className="brand">VoltSlot</Link>
      <nav>
        <NavLink to="/" end>Stations</NavLink>
        {user && <NavLink to="/bookings">My bookings</NavLink>}
        {user?.role === "ADMIN" && <NavLink to="/admin">Manage</NavLink>}
      </nav>
      <div className="nav-right">
        {user ? (
          <>
            <span className="who">{user.name}</span>
            <button className="btn ghost" onClick={() => { logout(); navigate("/"); }}>Log out</button>
          </>
        ) : (
          <Link className="btn" to="/login">Log in</Link>
        )}
      </div>
    </header>
  );
}
