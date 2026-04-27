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
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
        <div className="mb-8 flex flex-col gap-2 border-b border-slate-200 pb-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Welcome, {user.name}
          </h1>
          <p className="text-sm text-slate-600">{user.email}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Role: {normalizedRole || "user"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => navigate("/jobs")}
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            View Jobs
          </button>

          <button
            onClick={() => navigate("/post-job")}
            className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Post Job
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate("/admin/jobs")}
              className="rounded-lg bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Admin Panel
            </button>
          )}

          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="rounded-lg bg-slate-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Logout
          </button>
        </div>

        {!isAdmin && (
          <p className="mt-4 text-sm text-slate-500">
            Admin panel appears automatically when your account role is admin.
          </p>
        )}
      </div>
    </div>
  );
}