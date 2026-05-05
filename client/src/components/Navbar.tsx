import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
        <img
          src="/logo.png"
          alt="CareerSync AI"
          style={{ width: "40px", height: "40px", borderRadius: "6px" }}
        />
        <div className="navbar-logo">CareerSync AI</div>
      </Link>

      <ul className="navbar-nav">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/jobs">Jobs</Link>
        </li>
        <li>
          <Link to="/about">About Us</Link>
        </li>
        <li>
          <Link to="/contact">Contact Us</Link>
        </li>
      </ul>

      <div className="navbar-auth">
        <Link to="/login" className="btn-secondary">
          Login
        </Link>
        <Link to="/register" className="btn">
          Register
        </Link>
      </div>
    </nav>
  );
}
