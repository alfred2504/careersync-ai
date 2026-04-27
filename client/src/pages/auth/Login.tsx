import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await loginUser(form);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard"); // ✅ clean redirect
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="register-page">
      <form onSubmit={handleSubmit} className="register-card">
        <h2 className="register-title">Login</h2>

        <input
          name="email"
          placeholder="Email"
          className="register-input"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="register-input"
          onChange={handleChange}
        />

        <button className="register-button">
          Login
        </button>

        <div className="auth-links">
          <Link to="/register" className="auth-link">Need an account? Register</Link>
        </div>
      </form>
    </div>
  );
}