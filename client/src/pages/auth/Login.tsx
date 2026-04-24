import { useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        setLoading(false);
        return;
      }

      // ✅ Save token
      localStorage.setItem("token", data.token);

      // ✅ Save user
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful 🚀");

      // 👉 redirect
      window.location.href = "/dashboard";

    } catch (error) {
      alert("Network error");
    }

    setLoading(false);
  };

  return (
    <div className="register-page">
      <form onSubmit={handleSubmit} className="register-card">
        <h2 className="register-title">Login</h2>

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="register-input"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="register-input"
        />

        <button
          type="submit"
          className="register-button"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="auth-links">
          <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          <Link to="/register" className="auth-link">Create account</Link>
        </div>
      </form>
    </div>
  );
}