import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs, type Job } from "../services/jobService";

export default function Landing() {
  const navigate = useNavigate();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTitle, setSearchTitle] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const jobs = await getJobs();
        // Sort by most recent and take top 6
        const sorted = jobs
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 6);
        setRecentJobs(sorted);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTitle.trim()) {
      navigate(`/jobs?title=${encodeURIComponent(searchTitle)}`);
    } else {
      navigate("/jobs");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">Find Your Dream Job Today!</h1>
        <p className="hero-subtitle">
          Connecting Talent with Opportunity. Your Gateway to Career Success
        </p>

        {/* Search Bar */}
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Job Title or Company"
            className="search-input"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
          <select className="search-select" disabled>
            <option>Select Location</option>
          </select>
          <select className="search-select" disabled>
            <option>Select Category</option>
          </select>
          <button type="submit" className="btn">
            Search Job
          </button>
        </form>


        {/* Stats */}
        <div className="stats">
          <div className="stat-item">
            <div className="stat-icon">💼</div>
            <div className="stat-number">{recentJobs.length}+</div>
            <div className="stat-label">Jobs Available</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🏢</div>
            <div className="stat-number">
              {new Set(recentJobs.map((j) => j.company)).size}+
            </div>
            <div className="stat-label">Top Companies</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">👤</div>
            <div className="stat-number">1000+</div>
            <div className="stat-label">Candidates</div>
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="companies">
        <p className="companies-title">Trusted by leading companies</p>
        <div className="companies-grid">
          {Array.from(new Set(recentJobs.map((j) => j.company)))
            .slice(0, 5)
            .map((company) => (
              <div key={company}>{company}</div>
            ))}
        </div>
      </section>

      {/* Recent Jobs Section */}
      <section className="recent-jobs">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Recent Jobs Available</h2>
            <a href="/jobs" className="view-all">
              View all →
            </a>
          </div>

          <p style={{ color: "var(--text-light)", marginBottom: "2rem" }}>
            Explore the latest job opportunities from top companies. Find roles
            that match your skills and aspirations.
          </p>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "var(--text-light)",
              }}
            >
              Loading recent jobs...
            </div>
          ) : recentJobs.length > 0 ? (
            <div className="jobs-grid">
              {recentJobs.map((job) => (
                <div key={job._id} className="job-card">
                  <div className="job-card-posted">
                    {formatDate(job.createdAt)}
                  </div>

                  <div className="job-card-header">
                    <div className="job-company-icon">🏢</div>
                    <div className="job-card-info">
                      <div className="job-card-title">{job.title}</div>
                      <div className="job-card-company">{job.company}</div>
                    </div>
                  </div>

                  <div className="job-card-details">
                    <div className="job-detail-item">
                      <span className="job-detail-icon">📌</span>
                      {job.category || "Uncategorized"}
                    </div>
                    <div className="job-detail-item">
                      <span className="job-detail-icon">⏱️</span>
                      {job.employmentType || "Not specified"}
                    </div>
                    <div className="job-detail-item">
                      <span className="job-detail-icon">💰</span>
                      {job.salaryRange || "Competitive"}
                    </div>
                    <div className="job-detail-item">
                      <span className="job-detail-icon">📍</span>
                      {job.location}
                    </div>
                  </div>

                  <div className="job-card-footer">
                    <div className="job-card-location">{job.location}</div>
                    <div className="job-card-actions">
                      <button className="job-bookmark">🔖</button>
                      <button
                        className="btn"
                        onClick={() => navigate(`/job/${job._id}`)}
                      >
                        Job Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "var(--text-light)",
              }}
            >
              No jobs available at the moment. Check back soon!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
