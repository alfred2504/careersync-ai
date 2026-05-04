import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  role: "jobSeeker" | "jobPoster";
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
  const location = useLocation();
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    role: "jobSeeker",
  });
  const [inviteToken, setInviteToken] = useState("");
  const [inviteLocked, setInviteLocked] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("invite") || "";
    const email = params.get("email") || "";

    setInviteToken(token);
    setInviteLocked(Boolean(token && email));

    if (email) {
      setForm((current) => ({ ...current, email }));
    }
  }, [location.search]);

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
      const data = await registerUser({ ...form, inviteToken });
      alert(data.message);
      navigate("/login");
    } catch (err: unknown) {
      const error = err as ErrorResponseShape;
      alert(error.response?.data?.message || "Error");
    }
  };

  return (
    <div className="register-page">
      <header className="auth-header">
        <div className="auth-brand">
          <img src="/logo.png" alt="" aria-hidden="true" className="auth-brand-icon" />
          <span>CareerSync AI</span>
        </div>
      </header>
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
          value={form.email}
          readOnly={inviteLocked}
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
        </select>

        {inviteToken && (
          <p className="info-copy">
            This invite will grant admin panel access after registration.
          </p>
        )}

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