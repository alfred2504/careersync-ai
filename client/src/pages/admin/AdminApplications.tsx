import { useEffect, useState } from "react";
import { getAllJobs } from "../../services/jobService";
import { downloadApplicationCv, getApplications, updateApplicationStatus } from "../../services/applicationService";

export default function AdminApplications() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const jobsData = await getAllJobs();
        setJobs(jobsData || []);
        if (jobsData && jobsData.length) {
          setSelectedJobId(jobsData[0]._id);
        }
      } catch (err) {
        console.error("Failed to load jobs:", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;
    setLoading(true);
    (async () => {
      try {
        const apps = await getApplications(selectedJobId);
        setApplications(apps || []);
      } catch (err) {
        console.error("Failed to load applications:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedJobId]);

  const handleStatus = async (applicationId: string, status: string) => {
    try {
      const res = await updateApplicationStatus(applicationId, status);
      // update local state
      setApplications((prev) => prev.map((a) => (a._id === applicationId ? res.application : a)));
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update application status");
    }
  };

  const handleDownloadCv = async (applicationId: string, cvOriginalName?: string) => {
    try {
      await downloadApplicationCv(applicationId, cvOriginalName || "candidate-cv");
    } catch (err) {
      console.error("Failed to download CV:", err);
      alert("Failed to download CV");
    }
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <section className="admin-page-header">
        <div>
          <p className="section-kicker">Applications</p>
          <h1>Manage Applications</h1>
          <p>Review candidates and approve or reject them from one place.</p>
        </div>
      </section>

      <section className="site-card admin-form-card" style={{ marginBottom: "1.25rem" }}>
        <label className="admin-form-label" htmlFor="job-select">
          Select job
        </label>
        <select
          id="job-select"
          className="search-input"
          value={selectedJobId || ""}
          onChange={(e) => setSelectedJobId(e.target.value)}
        >
          {jobs.map((j) => (
            <option key={j._id} value={j._id}>
              {j.title} — {j.company}
            </option>
          ))}
        </select>
      </section>

      <section className="site-card admin-list-card">
        {loading ? (
          <p>Loading applications...</p>
        ) : applications.length === 0 ? (
          <div className="admin-empty-state">
            <h3>No applications yet</h3>
            <p>Applications for the selected job will show here once candidates start applying.</p>
          </div>
        ) : (
          applications.map((a) => (
            <article key={a._id} className="admin-list-item admin-application-item">
              <div className="admin-application-content">
                <div className="admin-application-topline">
                  <div>
                    <h3>{a.user?.name || "Unknown"}</h3>
                    <p>{a.user?.email}</p>
                  </div>
                  <span className={`job-status job-status-${a.status || "pending"}`}>
                    {(a.status || "pending").toUpperCase()}
                  </span>
                </div>

                <p className="admin-application-cover">
                  {a.coverLetter || "No cover letter provided."}
                </p>

                <div className="admin-application-meta">
                  <span>CV: {a.cvOriginalName || "Uploaded file"}</span>
                  <span>Submitted: {a.createdAt ? new Date(a.createdAt).toLocaleString() : "Recently"}</span>
                </div>
              </div>

              <div className="admin-list-actions">
                <button className="btn-secondary" onClick={() => handleDownloadCv(a._id, a.cvOriginalName)}>
                  Download CV
                </button>
                {a.status !== "accepted" ? (
                  <button className="btn-secondary" onClick={() => handleStatus(a._id, "accepted")}>
                    Approve
                  </button>
                ) : null}
                {a.status !== "rejected" ? (
                  <button className="btn-secondary" onClick={() => handleStatus(a._id, "rejected")}>
                    Reject
                  </button>
                ) : null}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
