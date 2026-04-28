import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

type User = {
  role?: string;
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getStoredRole = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return "";
      const parsed: User = JSON.parse(storedUser);
      return typeof parsed?.role === "string" ? parsed.role.toLowerCase() : "";
    } catch {
      return "";
    }
  };

  const isAdmin = getStoredRole() === "admin";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
  }, [location.search]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();

    if (!query) {
      navigate("/job-listings");
      return;
    }

    navigate(`/job-listings?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="app-navbar">
      <div className="navbar-brand-group">
        <Link to="/dashboard" className="navbar-brand">
          CareerSync AI
        </Link>
        <span className="navbar-tag">Professional hiring workspace</span>
      </div>

      <form className="navbar-search" onSubmit={handleSubmit}>
        <input
          type="search"
          className="navbar-search-input"
          placeholder="Search jobs by title, company, or keyword"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button type="submit" className="navbar-search-button">
          Search
        </button>
      </form>

      <button
        type="button"
        className="navbar-hamburger"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      <nav
        className={`navbar-links ${mobileMenuOpen ? "mobile-open" : ""}`}
        aria-label="Primary navigation"
      >
        <Link to="/dashboard" className="navbar-link" onClick={handleNavClick}>
          Dashboard
        </Link>
        <Link to="/job-listings" className="navbar-link" onClick={handleNavClick}>
          Browse Jobs
        </Link>
        <Link to="/jobs" className="navbar-link" onClick={handleNavClick}>
          Apply
        </Link>
        <Link to="/post-job" className="navbar-link" onClick={handleNavClick}>
          Post Job
        </Link>
        {isAdmin && (
          <Link to="/admin/jobs" className="navbar-link" onClick={handleNavClick}>
            Admin Panel
          </Link>
        )}
      </nav>

      <button type="button" onClick={handleLogout} className="navbar-logout">
        Logout
      </button>
    </header>
  );
}