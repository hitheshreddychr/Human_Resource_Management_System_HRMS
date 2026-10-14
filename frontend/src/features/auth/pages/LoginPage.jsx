import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail, Users } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email.trim(), password);
      navigate(user?.role === "admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.detail || "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="brand-lockup">
          <span className="brand-mark"><Users size={25} /></span>
          <span>PeopleFirst<span className="brand-dot">.</span></span>
        </div>

        <div className="login-message">
          <span className="eyebrow">HUMAN RESOURCE MANAGEMENT</span>
          <h1>Great teams start with great people.</h1>
          <p>
            One workspace for your people, attendance, leave, and payroll.
          </p>
        </div>

        <div className="visual-footer">
          <span>People. Performance. Possibility.</span>
          <span>HRMS · 2026</span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-brand">PeopleFirst<span className="brand-dot">.</span></div>

          <div className="welcome-icon"><LockKeyhole size={24} /></div>
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Sign in to your workspace</h2>
          <p className="muted">Enter your company account details to continue.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Work email</label>
            <div className="input-wrap">
              <Mail size={18} />
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <LockKeyhole size={18} />
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button className="primary-button login-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="login-note">
            Need an account? Contact your HR administrator.
          </p>
        </div>
      </section>
    </main>
  );
}
