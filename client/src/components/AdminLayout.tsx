import { type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthUser } from "../services/authService";


type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const user = getAuthUser();

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div>
            <p className="section-kicker">Admin</p>
            <h2>CareerSync AI</h2>
          </div>
        </div>

        <div className="admin-sidebar-user">
          <span>Signed in as</span>
          <strong>{user?.name || "Admin"}</strong>
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink to="/admin/jobs" end className={({ isActive }) => `admin-sidebar-link ${isActive ? "is-active" : ""}`}>
            Manage Jobs
          </NavLink>
          <NavLink to="/admin/jobs/new" className={({ isActive }) => `admin-sidebar-link ${isActive ? "is-active" : ""}`}>
            Post Job
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <button type="button" className="btn-secondary admin-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}