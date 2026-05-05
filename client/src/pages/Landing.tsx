import Navbar from "../components/Navbar";

interface Job {
  id: string;
  posted: string;
  title: string;
  company: string;
  category: string;
  type: string;
  salary: string;
  location: string;
  icon: string;
}

const RECENT_JOBS: Job[] = [
  {
    id: "1",
    posted: "1 hr ago",
    title: "Forward Security Director",
    company: "Reach Software and Studios Co.",
    category: "Human & Tourism",
    type: "Full-time",
    salary: "$40000-$45000",
    location: "New York, USA",
    icon: "🏢",
  },
  {
    id: "2",
    posted: "5 hrs ago",
    title: "Regional Creative Facilitator",
    company: "Metaos - Scratch Co.",
    category: "Media",
    type: "Part-time",
    salary: "$30000-$35000",
    location: "Los Angeles, USA",
    icon: "🎨",
  },
  {
    id: "3",
    posted: "2 hrs ago",
    title: "Internal Integration Planner",
    company: "Mics, Quigley and Peroni Inc.",
    category: "Consulting",
    type: "Full-time",
    salary: "$40000-$50000",
    location: "Texas, USA",
    icon: "📊",
  },
];

export default function Landing() {
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
        <div className="search-bar">
          <input
            type="text"
            placeholder="Job Title or Company"
            className="search-input"
          />
          <select className="search-select">
            <option>Select Location</option>
            <option>New York</option>
            <option>Los Angeles</option>
            <option>San Francisco</option>
          </select>
          <select className="search-select">
            <option>Select Category</option>
            <option>Technology</option>
            <option>Finance</option>
            <option>Design</option>
          </select>
          <button className="btn">Search Job</button>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat-item">
            <div className="stat-icon">💼</div>
            <div className="stat-number">25,860</div>
            <div className="stat-label">Jobs</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🏢</div>
            <div className="stat-number">10,250</div>
            <div className="stat-label">Companies</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">👤</div>
            <div className="stat-number">18,400</div>
            <div className="stat-label">Candidates</div>
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="companies">
        <p className="companies-title">Trusted by leading companies</p>
        <div className="companies-grid">
          <div>Spotify</div>
          <div>Slack</div>
          <div>Adobe</div>
          <div>Asana</div>
          <div>Linear</div>
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
            As an Jobsite platform Idealedcalt, email locat ist decent steat.
          </p>

          <div className="jobs-grid">
            {RECENT_JOBS.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-card-posted">{job.posted}</div>

                <div className="job-card-header">
                  <div className="job-company-icon">{job.icon}</div>
                  <div className="job-card-info">
                    <div className="job-card-title">{job.title}</div>
                    <div className="job-card-company">{job.company}</div>
                  </div>
                </div>

                <div className="job-card-details">
                  <div className="job-detail-item">
                    <span className="job-detail-icon">📌</span>
                    {job.category}
                  </div>
                  <div className="job-detail-item">
                    <span className="job-detail-icon">⏱️</span>
                    {job.type}
                  </div>
                  <div className="job-detail-item">
                    <span className="job-detail-icon">💰</span>
                    {job.salary}
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
                    <button className="btn">Job Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
