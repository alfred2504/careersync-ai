import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, saveAuthSession } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();
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
    <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "var(--bg-dark)" }}>
      {/* Left Side - Logo & Branding */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          color: "white",
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <img
            src="/logo.png"
            alt="Careersync AI"
            style={{ width: "120px", height: "120px", marginBottom: "1rem" }}
          />
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "0.5rem" }}>
            CareerSync AI
          </h1>
          <p style={{ fontSize: "1.1rem", color: "rgba(255, 255, 255, 0.7)" }}>
            Your Gateway to Career Success
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          backgroundColor: "white",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <h2 style={{ marginBottom: "1rem", color: "var(--text-dark)" }}>Create Account</h2>
          <p style={{ marginBottom: "2rem", color: "var(--text-light)" }}>
            Join thousands of job seekers and employers
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

          {/* User Type */}
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
                Employer accounts require an invite token from the admin.
              </p>
            ) : null}
          </div>

          {formData.userType === "employer" ? (
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Invite Token
              </label>
              <input
                type="text"
                name="inviteToken"
                value={formData.inviteToken}
                onChange={handleChange}
                placeholder="Paste your invite token"
                className="search-input"
                style={{ width: "100%" }}
              />
            </div>
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
