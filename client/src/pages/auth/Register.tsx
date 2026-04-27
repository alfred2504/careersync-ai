import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  role: "jobSeeker" | "jobPoster" | "admin";
};

type ErrorResponseShape = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    role: "jobSeeker",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setForm((prev) =>
      name === "role"
        ? { ...prev, role: value as RegisterForm["role"] }
        : { ...prev, [name]: value }
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const data = await registerUser(form);
      alert(data.message);
      navigate("/login");
    } catch (err: unknown) {
      const error = err as ErrorResponseShape;
      alert(error.response?.data?.message || "Error");
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