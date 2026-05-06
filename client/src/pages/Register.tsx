import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { registerUser, saveAuthSession } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "candidate",
    inviteToken: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const inviteToken = searchParams.get("inviteToken") || searchParams.get("token") || "";

    if (inviteToken) {
      setFormData((prev) => ({ ...prev, inviteToken, userType: "employer" }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const role = formData.userType === "employer" ? "admin" : "user";

      if (role === "admin" && !formData.inviteToken) {
        setError("Employer registration requires an invite link from your email.");
        setLoading(false);
        return;
      }

      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        inviteToken: formData.inviteToken || undefined,
      });

      saveAuthSession(response.token, response.user);
      navigate("/jobs");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create account. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Left Side - Logo & Branding */}
      <div className="auth-visual">
        <div className="auth-brand">
          <img
            src="/logo.png"
            alt="Careersync AI"
            className="auth-brand-logo"
          />
          <h1>
            CareerSync AI
          </h1>
          <p>
            Your Gateway to Career Success
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-panel">
        <div className="auth-toggle-row" />

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Create Account</h2>
          <p>
            Join thousands of job seekers and employers on CareerSync AI
          </p>

          {error ? (
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "0.9rem 1rem",
                borderRadius: "10px",
                background: "#fee2e2",
                color: "#b91c1c",
                fontSize: "0.95rem",
              }}
            >
              {error}
            </div>
          ) : null}

          {/* Full Name */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="search-input"
              style={{ width: "100%" }}
              required
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="search-input"
              style={{ width: "100%" }}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              I am a:
            </label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="search-select"
              style={{ width: "100%" }}
            >
              <option value="candidate">Job Seeker</option>
              <option value="employer">Employer</option>
            </select>
            {formData.userType === "employer" ? (
              <p style={{ marginTop: "0.6rem", fontSize: "0.9rem", color: "var(--text-light)" }}>
                Employers can only register using the invite link sent to their email.
              </p>
            ) : null}
          </div>

          <input type="hidden" name="inviteToken" value={formData.inviteToken} />
          {formData.inviteToken ? (
            <p style={{ marginBottom: "1.5rem", fontSize: "0.9rem", color: "var(--text-light)" }}>
              Invite link detected from your email. You can continue registration now.
            </p>
          ) : null}

          {/* Password */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="search-input"
              style={{ width: "100%" }}
              required
            />
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="search-input"
              style={{ width: "100%" }}
              required
            />
          </div>

          {/* Terms */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.9rem" }}>
              <input type="checkbox" style={{ marginTop: "4px" }} required />
              <span>
                I agree to the{" "}
                <Link to="/terms" style={{ color: "var(--primary)", textDecoration: "none" }}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" style={{ color: "var(--primary)", textDecoration: "none" }}>
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn"
            style={{ width: "100%", marginBottom: "1rem" }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Login Link */}
          <p style={{ textAlign: "center", color: "var(--text-light)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
