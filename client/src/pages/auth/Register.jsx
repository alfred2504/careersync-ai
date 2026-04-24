import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "jobSeeker",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await registerUser(form);
      alert(data.message);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="register-page">
      <form onSubmit={handleSubmit} className="register-card">
        <h2 className="register-title">Register</h2>

        <input
          name="name"
          placeholder="Name"
          className="register-input"
          onChange={handleChange}
        />

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

        <label className="register-label" htmlFor="role">Registering as</label>
        <select
          id="role"
          name="role"
          className="register-input"
          value={form.role}
          onChange={handleChange}
        >
          <option value="jobSeeker">Job Seeker</option>
          <option value="jobPoster">Job Poster</option>
          <option value="admin">Admin</option>
        </select>

        <button className="register-button">
          Register
        </button>

        <div className="auth-links">
          <Link to="/login" className="auth-link">Already have an account? Login</Link>
        </div>
      </form>
    </div>
  );
}