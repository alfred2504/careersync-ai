import { useEffect, useState } from "react";
// AdminLayout removed: global authenticated sidebar used instead
import { getAllJobs, updateJobStatus } from "../../services/jobService";

export default function AdminJobs() {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const data = await getAllJobs();
      setJobs(data);
    };

    fetch();
  }, []);

  const handleStatus = async (id: string, status: string) => {
    await updateJobStatus(id, status);
    window.location.reload();
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <section className="admin-page-header">
        <div>
          <p className="section-kicker">Jobs</p>
          <h1>Manage Jobs</h1>
          <p>Review and moderate job posts.</p>
        </div>
      </section>

      <section className="site-card">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <article key={job._id} className="jobs-list-item">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <h3 style={{ margin: 0 }}>{job.title}</h3>
                  <span className={`job-status job-status-${(job.status || 'pending')}`}>{(job.status || 'pending').toUpperCase()}</span>
                </div>
                <p>{job.company}</p>
              </div>
              <div className="admin-list-actions">
                <button className="btn-secondary" onClick={() => handleStatus(job._id, "approved")}>
                  Approve
                </button>
                <button className="btn-secondary" onClick={() => handleStatus(job._id, "rejected")}>
                  Reject
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="admin-empty-state">
            <h3>No jobs yet</h3>
            <p>Use the Post Job page to publish the first opening.</p>
          </div>
        )}
      </section>
    </div>
  );
}