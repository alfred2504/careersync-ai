import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthUser, clearAuthSession } from "../services/authService";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = getAuthUser();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    clearAuthSession();
    closeMenu();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link
        to="/"
        className="navbar-brand"
        onClick={closeMenu}
      >
        <img
          src="/logo.png"
          alt="CareerSync AI"
          className="navbar-brand-logo"
        />
        <div className="navbar-logo">CareerSync AI</div>
      </Link>

      <button
        type="button"
        className="navbar-toggle"
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`navbar-menu ${menuOpen ? "is-open" : ""}`}>
        <ul className="navbar-nav">
          <li>
            <Link to="/" onClick={closeMenu}>Home</Link>
          </li>
          <li>
            <Link to="/jobs" onClick={closeMenu}>Jobs</Link>
          </li>
          <li>
            <Link to="/about" onClick={closeMenu}>About Us</Link>
          </li>
          <li>
            <Link to="/contact" onClick={closeMenu}>Contact Us</Link>
          </li>
          {user?.role === "admin" ? (
            <>
              <li>
                <Link to="/admin/jobs" onClick={closeMenu}>Admin</Link>
              </li>
              <li>
                <Link to="/admin/jobs/new" onClick={closeMenu}>Post Job</Link>
              </li>
            </>
          ) : null}
        </ul>

          <div className="navbar-auth">
            <ThemeToggle />
            {user ? (
              <>
                <span style={{ color: 'white', fontWeight: 600, marginRight: '0.5rem' }}>{user.name || user.email}</span>
                <button type="button" className="btn-secondary" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn" onClick={closeMenu}>
                  Register
                </Link>
              </>
            )}
          </div>
      </div>
    </nav>
  );
}
