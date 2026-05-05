import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

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
        </ul>

        <div className="navbar-auth">
          <Link to="/login" className="btn-secondary" onClick={closeMenu}>
            Login
          </Link>
          <Link to="/register" className="btn" onClick={closeMenu}>
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
