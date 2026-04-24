import { useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || "If an account exists, reset instructions were sent.");
    } catch (error) {
      setMessage("Unable to send reset request right now. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="register-page">
      <form onSubmit={handleSubmit} className="register-card">
        <h2 className="register-title">Forgot Password</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="register-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" className="register-button" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </button>

        {message && <p className="auth-message">{message}</p>}

        <div className="auth-links">
          <Link to="/login" className="auth-link">Back to Login</Link>
          <Link to="/register" className="auth-link">Create account</Link>
        </div>
      </form>
    </div>
  );
}