export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <>
      <section className="dashboard-hero-card">
        <h1 className="dashboard-heading">Welcome, {user?.name || "Job Seeker"}</h1>
        <p className="dashboard-subtext">
          Track applications, discover matched opportunities, and optimize your profile from one place.
        </p>
      </section>

      <section className="dashboard-stats-grid">
        <article className="dashboard-stat-card">
          <h3>Saved Jobs</h3>
          <p>12</p>
        </article>
        <article className="dashboard-stat-card">
          <h3>Applications</h3>
          <p>5</p>
        </article>
        <article className="dashboard-stat-card">
          <h3>Profile Match</h3>
          <p>82%</p>
        </article>
      </section>
    </>
  );
}