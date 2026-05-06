import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { getJobs, type Job as JobItem } from "../services/jobService";
import { clearAuthSession, getAuthUser } from "../services/authService";

const zimbabweCities = [
  "Harare",
  "Bulawayo",
  "Chitungwiza",
  "Mutare",
  "Gweru",
  "Kwekwe",
  "Kadoma",
  "Masvingo",
  "Marondera",
  "Norton",
  "Zvishavane",
  "Hwange",
  "Bindura",
  "Chinhoyi",
  "Kariba",
  "Victoria Falls",
  "Redcliff",
  "Rusape",
  "Chegutu",
  "Shurugwi",
  "Gokwe",
  "Beitbridge",
  "Lupane",
  "Karoi",
  "Mvurwi",
];

const formatPostedTime = (createdAt?: string) => {
  if (!createdAt) {
    return "Recently";
  }

  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} d ago`;
};

const jobSnippet = (description: string) =>
  description.length > 120 ? `${description.slice(0, 120)}...` : description;

const getCompanyInitial = (company: string) => company.trim().charAt(0).toUpperCase() || "?";

const formatJobMetadata = (job: JobItem) => [
  job.category || "General",
  job.employmentType || "Full time",
  job.salaryRange || "Negotiable",
  job.location,
];

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [titleQuery, setTitleQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const user = getAuthUser();

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const data = await getJobs({
          title: titleQuery,
          location: locationQuery,
        });
        setJobs(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch jobs";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [titleQuery, locationQuery]);

  const visibleJobs = useMemo(() => jobs.filter((job) => job.status !== "rejected"), [jobs]);

  const topCompanies = useMemo(() => {
    const companyTotals = visibleJobs.reduce<Record<string, number>>((accumulator, job) => {
      const companyName = job.company.trim();
      accumulator[companyName] = (accumulator[companyName] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(companyTotals)
      .map(([name, count]) => ({
        name,
        jobs: `${count} open job${count === 1 ? "" : "s"}`,
        logo: getCompanyInitial(name),
      }))
      .sort((first, second) => {
        const firstCount = Number(first.jobs.split(" ")[0]);
        const secondCount = Number(second.jobs.split(" ")[0]);
        return secondCount - firstCount;
      })
      .slice(0, 4);
  }, [visibleJobs]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  return (
    <div className="jobs-page">
      
      <section className="jobs-hero">
        <div className="jobs-hero-inner">
          <h1>Jobs</h1>
        </div>
      </section>

      <section className="jobs-layout container">
        <aside className="jobs-sidebar">
          <div className="filter-card">
            <h3>Search by Job Title</h3>
            <input
              className="search-input jobs-search"
              type="text"
              placeholder="Job title or company"
              value={titleQuery}
              onChange={(event) => setTitleQuery(event.target.value)}
            />
          </div>

          <div className="filter-card">
            <h3>Location</h3>
            <select
              className="search-select jobs-select"
              value={locationQuery}
              onChange={(event) => setLocationQuery(event.target.value)}
            >
              <option value="">All Zimbabwe Cities</option>
              {zimbabweCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-card">
            <h3>Category</h3>
            <ul className="filter-list">
              <li><span>Telecommunications</span><span>10</span></li>
              <li><span>Hotels & Tourism</span><span>10</span></li>
              <li><span>Education</span><span>10</span></li>
              <li><span>Financial Services</span><span>10</span></li>
            </ul>
          </div>

          <div className="filter-card promo-card">
            <h3>WE ARE HIRING</h3>
            <p>Apply Today!</p>
          </div>

          {user ? (
            <div className="filter-card sidebar-action-card">
              <h3>Account</h3>
              <p>You're signed in as {user.name}.</p>
              <button type="button" className="btn-secondary sidebar-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : null}
        </aside>

        <main className="jobs-main">
          <div className="jobs-toolbar">
            <p>Showing {visibleJobs.length} jobs from database</p>
            <select className="search-select jobs-sort">
              <option>Sort by latest</option>
              <option>Sort by oldest</option>
            </select>
          </div>

          {error ? <p style={{ marginBottom: "1rem", color: "crimson" }}>{error}</p> : null}

          <div className="jobs-list-placeholder">
            {loading ? (
              <div className="jobs-list-item">
                <div>
                  <h3>Loading jobs...</h3>
                  <p>Fetching jobs from the database</p>
                </div>
              </div>
            ) : visibleJobs.length === 0 ? (
              <div className="jobs-list-item">
                <div>
                    <h3>No jobs found</h3>
                    <p>Try another job title or choose a different Zimbabwe city.</p>
                </div>
              </div>
            ) : (
              visibleJobs.map((job) => (
                <div key={job._id} className="jobs-list-item">
                  <div>
                    <span className="job-card-posted">{formatPostedTime(job.createdAt)}</span>
                    <h3>{job.title}</h3>
                    <p>{job.company}</p>
                    <p style={{ marginTop: "0.35rem", maxWidth: "700px" }}>{jobSnippet(job.description)}</p>
                    <div className="job-card-meta">
                      {formatJobMetadata(job).map((item) => (
                        <span key={item} className="job-card-meta-chip">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link className="btn" to={`/jobs/${job._id}`}>
                    Job Details
                  </Link>
                </div>
              ))
            )}
          </div>
        </main>
      </section>

      <section className="top-company-section">
        <div className="container">
          <h2>Top Companies</h2>
          <p>Explore the companies that are actively hiring right now across Zimbabwe.</p>

          {topCompanies.length > 0 ? (
            <div className="top-company-grid">
              {topCompanies.map((company) => (
                <article key={company.name} className="company-card">
                  <div className="company-logo-box">{company.logo}</div>
                  <h3>{company.name}</h3>
                  <p>Browse current openings and find the right role for your experience level.</p>
                  <span>{company.jobs}</span>
                </article>
              ))}
            </div>
          ) : (
            <div className="jobs-list-item" style={{ marginTop: "2rem" }}>
              <div>
                <p>Post jobs from the backend and this section will populate automatically.</p>
                <p>Post jobs from the backend and this section will populate automatically.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
