import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, saveAuthSession } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await loginUser({ email, password });
      saveAuthSession(response.token, response.user);
      navigate("/jobs");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in. Please try again.";
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
          <h2 style={{ marginBottom: "1rem", color: "var(--text-dark)" }}>Welcome Back</h2>
          <p style={{ marginBottom: "2rem", color: "var(--text-light)" }}>
            Sign in to your account to continue
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

          {/* Email */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="search-input"
              style={{ width: "100%" }}
              required
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="search-input"
              style={{ width: "100%" }}
              required
            />
          </div>

          {/* Remember & Forgot */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "2rem",
              fontSize: "0.9rem",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" />
              Remember me
            </label>
            <Link to="/forgot-password" style={{ color: "var(--primary)", textDecoration: "none" }}>
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn"
            style={{ width: "100%", marginBottom: "1rem" }}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Register Link */}
          <p style={{ textAlign: "center", color: "var(--text-light)" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
