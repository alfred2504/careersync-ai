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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => navigate("/jobs")}
            className="primary-action"
          >
            View Jobs
          </button>

          <button
            onClick={() => navigate("/post-job")}
            className="primary-action"
          >
            Post Job
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate("/admin/jobs")}
              className="primary-action"
            >
              Admin Panel
            </button>
          )}

          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="primary-action"
          >
            Logout
          </button>
          </div>

          {!isAdmin && (
            <div className="info-card">
              <p className="info-title">What you can do next</p>
              <p className="muted-copy leading-7 text-slate-600">
                Browse active jobs, submit your CV, and keep your profile ready for recruiter review.
                The admin panel appears automatically when your account role is admin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}