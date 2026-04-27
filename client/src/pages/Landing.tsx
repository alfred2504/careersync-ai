import { Link } from "react-router-dom";

const highlights = [
  {
    title: "AI-Smart Matching",
    text: "CareerSync ranks opportunities by skills, role goals, and profile strength.",
  },
  {
    title: "Fast Team Hiring",
    text: "Post roles, review applicants, and manage status from one clean workflow.",
  },
  {
    title: "Admin Oversight",
    text: "Approve job posts and keep quality high with role-based moderation tools.",
  },
];

export default function Landing() {
  const hasToken = Boolean(localStorage.getItem("token"));

  return (
    <div className="landing-page">
      <div className="landing-bg-orb landing-bg-orb-one" />
      <div className="landing-bg-orb landing-bg-orb-two" />

      <header className="landing-header">
        <p className="landing-brand">CareerSync AI</p>
        <nav className="landing-nav">
          <Link to="/login" className="landing-nav-link">
            Login
          </Link>
          <Link to="/register" className="landing-nav-link landing-nav-link-accent">
            Register
          </Link>
        </nav>
      </header>

      <main className="landing-hero">
        <section className="landing-copy">
          <p className="landing-kicker">Career platform for modern teams</p>
          <h1 className="landing-title">Find the right role. Hire the right talent.</h1>
          <p className="landing-subtitle">
            CareerSync AI connects job seekers, recruiters, and admins in one system built for speed,
            quality, and clean decision-making.
          </p>

          <div className="landing-cta-row">
            <Link to={hasToken ? "/dashboard" : "/login"} className="landing-cta-primary">
              {hasToken ? "Go to Dashboard" : "Get Started"}
            </Link>
            <Link to="/jobs" className="landing-cta-secondary">
              Explore Jobs
            </Link>
          </div>

          <div className="landing-metric-row">
            <article className="landing-metric-card">
              <p className="landing-metric-value">1.2K+</p>
              <p className="landing-metric-label">Active candidates</p>
            </article>
            <article className="landing-metric-card">
              <p className="landing-metric-value">260+</p>
              <p className="landing-metric-label">Open listings</p>
            </article>
            <article className="landing-metric-card">
              <p className="landing-metric-value">94%</p>
              <p className="landing-metric-label">Approval quality</p>
            </article>
          </div>
        </section>

        <aside className="landing-visual-panel" aria-hidden="true">
          <div className="landing-visual-shell">
            <div className="landing-visual-topbar">
              <span />
              <span />
              <span />
            </div>

            <div className="landing-visual-content">
              {highlights.map((item) => (
                <article key={item.title} className="landing-highlight-card">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
