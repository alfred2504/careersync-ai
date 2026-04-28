import { useEffect, useState } from "react";
import { getProfile } from "../services/userService";
import { useNavigate } from "react-router-dom";

type User = {
  name: string;
  email: string;
  role: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const getStoredRole = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return "";
      const parsed = JSON.parse(storedUser);
      return typeof parsed?.role === "string" ? parsed.role : "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch {
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-base font-medium">Loading dashboard...</p>
      </div>
    );
  }

  const normalizedRole = (user.role || getStoredRole()).toLowerCase();
  const isAdmin = normalizedRole === "admin";

  return (
    <div className="app-shell">
      <div className="page-frame">
        <section className="page-hero">
          <span className="section-chip">Workspace</span>
          <h1 className="page-title">Welcome, {user.name}</h1>
          <p className="page-subtitle">{user.email}</p>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Role: {normalizedRole || "user"}
          </p>
        </section>

        <div className="page-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="dashboard-summary-grid">
            <article className="info-card dashboard-summary-card">
              <p className="section-kicker text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Search
              </p>
              <h2 className="info-title">Use the navbar search to jump straight into hiring.</h2>
              <p className="muted-copy leading-7 text-slate-600">
                Search is now in the top navigation, so you can move between jobs and applications without
                hunting for controls on the dashboard.
              </p>
            </article>

            <article className="info-card dashboard-summary-card">
              <p className="section-kicker text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Quick access
              </p>
              <h2 className="info-title">Your main tools are always one click away.</h2>
              <p className="muted-copy leading-7 text-slate-600">
                Browse jobs, apply with a CV, post a new role, or review admin approvals from the shared
                navbar.
              </p>
            </article>

            <article className="info-card dashboard-summary-card">
              <p className="section-kicker text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Role
              </p>
              <h2 className="info-title">{isAdmin ? "Admin workspace" : "Candidate workspace"}</h2>
              <p className="muted-copy leading-7 text-slate-600">
                {isAdmin
                  ? "Approve and review submitted jobs from the protected navigation menu."
                  : "Track job opportunities and submit stronger applications from the same workspace."}
              </p>
            </article>
          </div>

          <div className="info-card">
            <p className="info-title">What changed</p>
            <p className="muted-copy leading-7 text-slate-600">
              Logout has moved into the navbar, and the dashboard is now focused on guidance rather than
              duplicating navigation controls.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}