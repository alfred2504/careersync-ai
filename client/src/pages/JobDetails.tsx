import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getJobById, getJobs, type Job as JobItem } from "../services/jobService";

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

const formatMoney = (value?: string) => value || "Negotiable";

const fallbackJob = (jobId: string): JobItem => ({
  _id: jobId,
  title: "Job not found",
  company: "CareerSync AI",
  location: "Zimbabwe",
  description: "The job you are looking for could not be found.",
});

const deriveBulletPoints = (description?: string, fallbackLabel?: string) => {
  if (!description) {
    return fallbackLabel ? [fallbackLabel] : [];
  }

  const sentences = description
    .split(/\.|\n/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 6);

  return sentences.length > 0 ? sentences : fallbackLabel ? [fallbackLabel] : [];
};

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState<JobItem | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJob = async () => {
      if (!id) {
        setError("Missing job id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [jobData, allJobs] = await Promise.all([getJobById(id), getJobs()]);
        setJob(jobData);

        const filteredRelated = allJobs
          .filter((item) => item._id !== id)
          .filter((item) => item.company === jobData.company || item.location === jobData.location)
          .slice(0, 3);

        setRelatedJobs(filteredRelated);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load job details";
        setError(message);
        setJob(fallbackJob(id));
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  const keyResponsibilities = useMemo(
    () => job?.responsibilities || deriveBulletPoints(job?.description, "Review the job description in the database for role expectations."),
    [job]
  );

  const professionalSkills = useMemo(
    () => job?.skills || job?.tags || deriveBulletPoints(job?.description, "Add role-specific skills in the backend job record."),
    [job]
  );

  const tags = job?.tags?.length ? job.tags : [job?.employmentType || "Full time", job?.category || "General", job?.location || "Zimbabwe"];

  return (
    <div className="jobs-page">
      <Navbar />

      <section className="jobs-hero">
        <div className="jobs-hero-inner">
          <h1>Job Details</h1>
        </div>
      </section>

      <section className="job-details-page container">
        {error ? <p style={{ color: "crimson", marginBottom: "1rem" }}>{error}</p> : null}

        {loading && !job ? (
          <div className="jobs-list-item">
            <div>
              <h3>Loading job details...</h3>
              <p>Fetching the latest information from the database</p>
            </div>
          </div>
        ) : job ? (
          <div className="job-details-layout">
            <main className="job-details-main">
              <span className="job-card-posted">{formatPostedTime(job.createdAt)}</span>
              <h2 className="job-details-title">{job.title}</h2>
              <p className="job-details-company">{job.company}</p>

              <div className="job-card-meta job-details-meta">
                <span className="job-card-meta-chip">{job.category || "General"}</span>
                <span className="job-card-meta-chip">{job.employmentType || "Full time"}</span>
                <span className="job-card-meta-chip">{formatMoney(job.salaryRange)}</span>
                <span className="job-card-meta-chip">{job.location}</span>
              </div>

              <section className="job-detail-block">
                <h3>Job Description</h3>
                <p>{job.description}</p>
              </section>

              <section className="job-detail-block">
                <h3>Key Responsibilities</h3>
                <ul className="detail-list">
                  {keyResponsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="job-detail-block">
                <h3>Professional Skills</h3>
                <ul className="detail-list">
                  {professionalSkills.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="job-detail-block">
                <h3>Tags</h3>
                <div className="job-card-meta">
                  {tags.map((tag) => (
                    <span key={tag} className="job-card-meta-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>

              <section className="job-detail-block">
                <h3>Share Job</h3>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <span className="job-card-meta-chip">Facebook</span>
                  <span className="job-card-meta-chip">X</span>
                  <span className="job-card-meta-chip">LinkedIn</span>
                </div>
              </section>
            </main>

            <aside className="job-details-sidebar">
              <div className="detail-card">
                <button className="btn" type="button" style={{ width: "100%" }}>
                  Apply Job
                </button>
              </div>

              <div className="detail-card">
                <h3>Job Overview</h3>
                <ul className="overview-list">
                  <li><span>Job Title</span><strong>{job.title}</strong></li>
                  <li><span>Job Type</span><strong>{job.employmentType || "Full time"}</strong></li>
                  <li><span>Category</span><strong>{job.category || "General"}</strong></li>
                  <li><span>Experience</span><strong>{job.experienceLevel || "Any level"}</strong></li>
                  <li><span>Offered Salary</span><strong>{formatMoney(job.salaryRange)}</strong></li>
                  <li><span>Location</span><strong>{job.location}</strong></li>
                </ul>
                <div className="map-preview">
                  <div className="map-dot" />
                  <span>{job.location}</span>
                </div>
              </div>

              <div className="detail-card">
                <h3>Send Us Message</h3>
                <form className="message-form">
                  <input className="search-input" type="text" placeholder="Full name" />
                  <input className="search-input" type="email" placeholder="Email Address" />
                  <input className="search-input" type="text" placeholder="Phone Number" />
                  <textarea className="search-input message-area" placeholder="Your Message" />
                  <button className="btn" type="button">
                    Send Message
                  </button>
                </form>
              </div>
            </aside>
          </div>
        ) : null}
      </section>

      <section className="related-jobs-section container">
        <h2>Related Jobs</h2>
        <p>Jobs from the database that match the same company or location.</p>

        <div className="jobs-list-placeholder">
          {relatedJobs.length > 0 ? (
            relatedJobs.map((relatedJob) => (
              <div key={relatedJob._id} className="jobs-list-item">
                <div>
                  <span className="job-card-posted">{formatPostedTime(relatedJob.createdAt)}</span>
                  <h3>{relatedJob.title}</h3>
                  <p>{relatedJob.company}</p>
                  <div className="job-card-meta">
                    <span className="job-card-meta-chip">{relatedJob.category || "General"}</span>
                    <span className="job-card-meta-chip">{relatedJob.employmentType || "Full time"}</span>
                    <span className="job-card-meta-chip">{relatedJob.location}</span>
                  </div>
                </div>
                <Link className="btn" to={`/jobs/${relatedJob._id}`}>
                  Job Details
                </Link>
              </div>
            ))
          ) : (
            <div className="jobs-list-item">
              <div>
                <h3>No related jobs found</h3>
                <p>More matching jobs will appear here once they exist in the database.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
