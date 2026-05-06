import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword({
        email,
        newPassword,
        confirmPassword,
      });
      setSuccess(response.message || "Password updated successfully.");
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      const submitMessage =
        submitError instanceof Error ? submitError.message : "Unable to reset password.";
      setError(submitMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
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
            Reset your password and continue
          </p>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-toggle-row auth-toggle-row-wide" />

        <form onSubmit={handleSubmit} className="auth-form auth-form-wide">
          <h2>Forgot Password</h2>
          <p>
            Enter your email and a new password to update your account.
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

          {success ? (
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "0.9rem 1rem",
                borderRadius: "10px",
                background: "#dcfce7",
                color: "#166534",
                fontSize: "0.95rem",
              }}
            >
              {success}
            </div>
          ) : null}

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="search-input"
              style={{ width: "100%" }}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Enter a new password"
              className="search-input"
              style={{ width: "100%" }}
              required
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your new password"
              className="search-input"
              style={{ width: "100%" }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn"
            style={{ width: "100%", marginBottom: "1rem" }}
            disabled={loading}
          >
            {loading ? "Updating Password..." : "Update Password"}
          </button>

          <p style={{ textAlign: "center", color: "var(--text-light)" }}>
            Remembered your password?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
