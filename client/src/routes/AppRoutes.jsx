import { useState } from "react";
import { BrowserRouter, Navigate, Routes, Route, Link, NavLink, Outlet, useLocation } from "react-router-dom";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Dashboard from "../pages/Dashboard";
import JobListings from "../pages/JobListings";

function Home() {
  return (
    <div className="jobs-page">
      <h1 className="jobs-title">Find Jobs Smarter with AI in Zimbabwe</h1>
      <p className="jobs-subtitle">Search local opportunities and discover featured roles.</p>
      <div className="auth-links" style={{ marginTop: "18px" }}>
        <Link to="/jobs" className="auth-link">Browse Job Listings</Link>
        <Link to="/register" className="auth-link">Create Account</Link>
      </div>
    </div>
  );
}

function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Job Listings", href: "/jobs" },
  ];

  const pageTitle =
    location.pathname === "/register"
      ? "Create Your Account"
      : location.pathname === "/login"
      ? "Welcome Back"
      : location.pathname === "/forgot-password"
      ? "Recover Your Password"
      : location.pathname === "/jobs"
      ? "Job Listings"
      : location.pathname === "/dashboard"
      ? "Dashboard"
      : "CareerSync AI";

  return (
    <div className="dashboard-layout">
      <aside className={`dashboard-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="dashboard-brand">CareerSync AI</div>

        <nav className="dashboard-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              className={({ isActive }) => `dashboard-nav-link ${isActive ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/login"
          className="dashboard-logout-link"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setMenuOpen(false);
          }}
        >
          Log out
        </Link>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-navbar">
          <button type="button" className="dashboard-menu-button" onClick={() => setMenuOpen((prev) => !prev)}>
            {menuOpen ? "Close" : "Menu"}
          </button>
          <div className="dashboard-navbar-title">{pageTitle}</div>
          <div className="dashboard-user-chip">{user?.name || "Guest"}</div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}