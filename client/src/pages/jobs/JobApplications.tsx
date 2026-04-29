import { useEffect, useState } from "react";
import { getApplications, updateApplicationStatus } from "../../services/applicationService";
import { useNavigate, useParams } from "react-router-dom";

type Application = {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  coverLetter?: string;
  cvUrl?: string;
  cvOriginalName?: string;
  createdAt?: string;
  status?: "pending" | "accepted" | "rejected";
};

export default function JobApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);

  const applicationsWithCv = applications.filter((application) => Boolean(application.cvUrl)).length;

  const formatDate = (value?: string) => {
    if (!value) return "Recently";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently";

    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "A";

  const handleStatusUpdate = async (applicationId: string, status: "accepted" | "rejected") => {
    setUpdatingApplicationId(applicationId);

    try {
      const response = await updateApplicationStatus(applicationId, status);
      setApplications((current) =>
        current.map((application) =>
          application._id === applicationId
            ? {
                ...application,
                status: response?.application?.status || status,
              }
            : application
        )
      );
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : "Failed to update application";
      setError(message);
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  useEffect(() => {
    const fetchApplications = async () => {
      if (!jobId || jobId.includes("{")) {
        console.warn("Invalid or missing jobId:", jobId);
        setApplications([]);
        setError("Invalid job link");
        setLoading(false);
        return;
      }

      try {
        setError("");
        const data = await getApplications(jobId);
        setApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
        setApplications([]);
        setError(
          error instanceof Error ? error.message : "Failed to fetch applications"
        );
      }
      setLoading(false);
    };

    fetchApplications();
  }, [jobId]);

  if (loading) {
    return (
      <div className="app-shell">
        <div className="page-frame">
          <section className="page-hero">
            <span className="section-chip">Applications</span>
            <h1 className="page-title">Loading applicant submissions...</h1>
            <p className="page-subtitle">Preparing CV links, cover letters, and applicant details.</p>
          </section>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell">
        <div className="page-frame">
          <section className="page-hero">
            <span className="section-chip">Applications</span>
            <h1 className="page-title">Unable to load applications</h1>
            <p className="page-subtitle">{error}</p>
          </section>

          <div className="page-grid" style={{ gridTemplateColumns: "1fr" }}>
            <div className="info-card">
              <p className="m-0 font-semibold">{error}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => navigate(-1)} className="primary-action">
                  Go back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="page-frame">
        <section className="page-hero">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="section-chip">Applications</span>
              <h1 className="page-title">Review every applicant in one clear view.</h1>
              <p className="page-subtitle">
                Compare cover letters, open CVs, and scan applicant details without leaving the page.
              </p>
            </div>

            <button onClick={() => navigate(-1)} className="primary-action">
              Back
            </button>
          </div>

          <div className="applications-summary-grid">
            <div className="summary-chip">
              <span className="summary-label">Applications</span>
              <strong>{applications.length}</strong>
            </div>
            <div className="summary-chip">
              <span className="summary-label">CVs attached</span>
              <strong>{applicationsWithCv}</strong>
            </div>
            <div className="summary-chip">
              <span className="summary-label">Response status</span>
              <strong>{applications.length > 0 ? "Ready" : "Waiting"}</strong>
            </div>
          </div>
        </section>

        <section className="page-grid applications-layout">
          <div className="content-stack">
            {applications.length === 0 && (
              <div className="info-card applications-empty">
                <p className="info-title">No applications yet</p>
                <p className="muted-copy leading-7 text-slate-600">
                  New submissions will appear here with the applicant name, email, cover letter, and CV link.
                </p>
              </div>
            )}

            {applications.map((app) => {
              const excerpt = app.coverLetter?.trim()
                ? app.coverLetter.trim().replace(/\s+/g, " ").slice(0, 220)
                : "No cover letter provided.";

              return (
                <article key={app._id} className="application-card">
                  <div className="application-card-top">
                    <div className="application-avatar">{getInitials(app.user.name)}</div>

                    <div className="application-card-heading">
                      <div>
                        <h3 className="application-name">{app.user.name}</h3>
                        <p className="application-email">{app.user.email}</p>
                      </div>

                      <div className="application-meta-row">
                        <span className="meta-pill">Applied {formatDate(app.createdAt)}</span>
                        <span className="meta-pill">{app.cvUrl ? "CV included" : "No CV attached"}</span>
                        <span className={`application-status-pill application-status-${app.status || "pending"}`}>
                          {app.status || "pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="application-body">
                    <div className="application-section">
                      <p className="section-kicker text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                        Cover letter
                      </p>
                      <p className="application-copy">{excerpt}</p>
                    </div>

                    <div className="application-actions">
                      {app.cvUrl ? (
                        <a
                          href={app.cvUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="primary-action application-cv-button"
                        >
                          {app.cvOriginalName || "Open CV"}
                        </a>
                      ) : (
                        <span className="meta-pill application-no-cv">CV not uploaded</span>
                      )}

                      <div className="application-decision-actions">
                        <button
                          type="button"
                          className="application-decision-button application-accept-button"
                          onClick={() => handleStatusUpdate(app._id, "accepted")}
                          disabled={updatingApplicationId === app._id || app.status === "accepted"}
                        >
                          {updatingApplicationId === app._id && app.status !== "accepted"
                            ? "Updating..."
                            : app.status === "accepted"
                              ? "Accepted"
                              : "Accept"}
                        </button>

                        <button
                          type="button"
                          className="application-decision-button application-reject-button"
                          onClick={() => handleStatusUpdate(app._id, "rejected")}
                          disabled={updatingApplicationId === app._id || app.status === "rejected"}
                        >
                          {updatingApplicationId === app._id && app.status !== "rejected"
                            ? "Updating..."
                            : app.status === "rejected"
                              ? "Rejected"
                              : "Reject"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="sidebar-panel">
            <div className="info-card">
              <p className="section-kicker text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Reading guide
              </p>
              <h3 className="info-title">Scan the strongest signals first.</h3>
              <div className="info-list">
                <div className="info-item">
                  <div className="info-badge">01</div>
                  <p className="info-text">Open the CV to validate skills and experience.</p>
                </div>
                <div className="info-item">
                  <div className="info-badge">02</div>
                  <p className="info-text">Read the cover letter excerpt for role fit and tone.</p>
                </div>
                <div className="info-item">
                  <div className="info-badge">03</div>
                  <p className="info-text">Use the applicant email for follow-up or shortlist notes.</p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}