import { useEffect, useMemo, useState } from "react";
import { getAllJobs, updateJobStatus } from "../../services/jobService";

type Job = {
  _id: string;
  title: string;
  company: string;
  status: string;
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const fetchJobs = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const data = await getAllJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleUpdate = async (id: string, status: string) => {
    setUpdatingJobId(id);
    setActionError("");
    setJobs((currentJobs) =>
      currentJobs.map((job) => (job._id === id ? { ...job, status } : job))
    );

    try {
      await updateJobStatus(id, status);
      await fetchJobs(false);
    } catch (error) {
      console.error("Failed to update job status:", error);
      setActionError("Could not update the job status. Please try again.");
      await fetchJobs(false);
    } finally {
      setUpdatingJobId(null);
    }
  };

  const stats = useMemo(() => {
    const normalizedJobs = jobs.map((job) => job.status.toLowerCase());
    const pending = normalizedJobs.filter((status) => status === "pending").length;
    const approved = normalizedJobs.filter((status) => status === "approved").length;
    const rejected = normalizedJobs.filter((status) => status === "rejected").length;

    return { pending, approved, rejected };
  }, [jobs]);

  const getStatusClass = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "approved") {
      return "application-status-accepted";
    }

    return `application-status-${normalizedStatus}`;
  };

  if (loading) {
    return (
      <div className="app-shell">
        <div className="page-frame">
          <div className="page-hero">
            <span className="section-chip">Admin panel</span>
            <h1 className="page-title page-title-brand">
              <span className="brand-with-icon">
                <img src="/logo.png" alt="" aria-hidden="true" className="brand-icon" />
                <span>CareerSync AI</span>
              </span>
            </h1>
            <p className="page-subtitle">Loading job approvals and moderation controls.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="page-frame">
        <section className="page-hero">
          <span className="section-chip">Admin panel</span>
          <h1 className="page-title page-title-brand">
            <span className="brand-with-icon">
              <img src="/logo.png" alt="" aria-hidden="true" className="brand-icon" />
              <span>CareerSync AI</span>
            </span>
          </h1>
          <p className="page-subtitle">
            Review job submissions, approve strong roles, and reject anything that does not meet the
            standard.
          </p>

          <div className="applications-summary-grid admin-summary-grid">
            <article className="summary-chip">
              <span className="summary-label">Total jobs</span>
              <strong>{jobs.length}</strong>
            </article>
            <article className="summary-chip">
              <span className="summary-label">Pending</span>
              <strong>{stats.pending}</strong>
            </article>
            <article className="summary-chip">
              <span className="summary-label">Reviewed</span>
              <strong>{stats.approved + stats.rejected}</strong>
            </article>
          </div>

          {actionError && <p className="admin-action-error">{actionError}</p>}
        </section>

        <div className="page-grid admin-page-grid" style={{ gridTemplateColumns: "1fr" }}>
          {jobs.length === 0 ? (
            <div className="info-card applications-empty">
              <p className="info-title">No jobs awaiting review</p>
              <p className="muted-copy leading-7 text-slate-600">
                When recruiters submit roles, they will appear here for approval.
              </p>
            </div>
          ) : (
            <div className="content-stack">
              {jobs.map((job) => (
                <article key={job._id} className="application-card admin-job-card">
                  <div className="application-card-top">
                    <div className="application-avatar">{job.title.slice(0, 2).toUpperCase()}</div>
                    <div className="application-card-heading">
                      <div>
                        <h3 className="application-name">{job.title}</h3>
                        <p className="application-email">{job.company}</p>
                      </div>
                      <div className="application-meta-row">
                        <span className={`application-status-pill ${getStatusClass(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="application-body">
                    <div className="application-section">
                      <p className="application-copy">Approve or reject this role based on quality, clarity, and fit.</p>
                    </div>

                    <div className="application-actions">
                      <div className="application-decision-actions">
                        <button
                          onClick={() => handleUpdate(job._id, "approved")}
                          className="application-decision-button application-accept-button"
                          disabled={updatingJobId === job._id}
                        >
                          {updatingJobId === job._id ? "Updating..." : "Approve"}
                        </button>

                        <button
                          onClick={() => handleUpdate(job._id, "rejected")}
                          className="application-decision-button application-reject-button"
                          disabled={updatingJobId === job._id}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}