import { useEffect, useState } from "react";
import API from "../services/api.js";

type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  isFeatured: boolean;
};

export default function JobListings() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    location: "",
    jobType: "",
    minSalary: "",
    maxSalary: "",
  });

  const loadJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (filters.search) params.set("search", filters.search);
      if (filters.location) params.set("location", filters.location);
      if (filters.jobType) params.set("jobType", filters.jobType);
      if (filters.minSalary) params.set("minSalary", filters.minSalary);
      if (filters.maxSalary) params.set("maxSalary", filters.maxSalary);

      const res = await fetch(`${API}/jobs?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch jobs.");
      }

      setJobs(data.jobs || []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Could not load jobs.");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loadJobs();
  };

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <h1 className="jobs-title">Job Listings</h1>
        <p className="jobs-subtitle">Find opportunities tailored for the Zimbabwe market.</p>
      </div>

      <form className="jobs-filters" onSubmit={handleFilterSubmit}>
        <input
          className="jobs-filter-input"
          name="search"
          placeholder="Search by title, company, or keyword"
          value={filters.search}
          onChange={handleFilterChange}
        />
        <input
          className="jobs-filter-input"
          name="location"
          placeholder="Location (e.g. Harare)"
          value={filters.location}
          onChange={handleFilterChange}
        />
        <select
          className="jobs-filter-input"
          name="jobType"
          value={filters.jobType}
          onChange={handleFilterChange}
        >
          <option value="">All job types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
          <option value="Remote">Remote</option>
        </select>
        <input
          className="jobs-filter-input"
          name="minSalary"
          type="number"
          min="0"
          placeholder="Min salary"
          value={filters.minSalary}
          onChange={handleFilterChange}
        />
        <input
          className="jobs-filter-input"
          name="maxSalary"
          type="number"
          min="0"
          placeholder="Max salary"
          value={filters.maxSalary}
          onChange={handleFilterChange}
        />
        <button className="jobs-filter-button" type="submit">
          Apply Filters
        </button>
      </form>

      {loading && <p className="jobs-info">Loading jobs...</p>}
      {error && <p className="jobs-error">{error}</p>}

      {!loading && !error && (
        <div className="jobs-grid">
          {jobs.length === 0 && <p className="jobs-info">No jobs found for the selected filters.</p>}

          {jobs.map((job) => (
            <article key={job._id} className="job-card">
              {job.isFeatured && <span className="job-badge">Featured</span>}
              <h2 className="job-title">{job.title}</h2>
              <p className="job-company">{job.company}</p>
              <p className="job-meta">{job.location} | {job.jobType}</p>
              <p className="job-meta">${job.salaryMin} - ${job.salaryMax} / month</p>
              <p className="job-description">{job.description}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
