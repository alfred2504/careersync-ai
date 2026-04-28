import { useEffect, useState } from "react";
import { getJobs } from "../../services/jobService";
import { applyToJob } from "../../services/applicationService";
import { useNavigate } from "react-router-dom";

type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
};

type ApplicationDraft = {
  coverLetter: string;
  cvFile: File | null;
};

const applicationTips = [
  "Tailor the cover letter to the role.",
  "Upload a clean PDF or DOCX CV.",
  "Keep your submission concise and relevant.",
];

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicationDrafts, setApplicationDrafts] = useState<
    Record<string, ApplicationDraft>
  >({});
  const [submittingJobId, setSubmittingJobId] = useState<string | null>(null);
  const navigate = useNavigate();

  const updateDraft = (jobId: string, draft: Partial<ApplicationDraft>) => {
    setApplicationDrafts((current) => ({
      ...current,
      [jobId]: {
        ...current[jobId],
        ...draft,
      },
    }));
  };

  const handleApply = async (jobId: string) => {
    const draft = applicationDrafts[jobId] ?? {
      coverLetter: "",
      cvFile: null,
    };

    const formData = new FormData();
    formData.append("jobId", jobId);

    if (draft.coverLetter.trim()) {
      formData.append("coverLetter", draft.coverLetter.trim());
    }

    if (draft.cvFile) {
      formData.append("cv", draft.cvFile);
    }

    setSubmittingJobId(jobId);

    try {
      const res = await applyToJob(formData);
      alert(res.message);
      setApplicationDrafts((current) => ({
        ...current,
        [jobId]: {
          coverLetter: "",
          cvFile: null,
        },
      }));
    } catch (err: any) {
      alert(err.response?.data?.message || "Login required");
      navigate("/login");
    } finally {
      setSubmittingJobId(null);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  if (loading) return <p>Loading jobs...</p>;

  return (
    <div className="app-shell">
      <div className="page-frame">
        <section className="page-hero">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="section-chip">Open roles</span>
              <h1 className="page-title">Apply with a CV that feels polished, not rushed.</h1>
              <p className="page-subtitle">
                Review the role details, share a short note, and submit your CV in one clean step.
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="primary-action"
            >
              Back to dashboard
            </button>
          </div>
        </section>

        <section className="page-grid">
          <div className="content-stack">
            {jobs.length === 0 && (
              <div className="info-card">
                <p className="m-0 font-semibold">No jobs available right now.</p>
              </div>
            )}

            {jobs.map((job) => {
              const application = applicationDrafts[job._id] ?? {
                coverLetter: "",
                cvFile: null,
              };

              return (
                <article key={job._id} className="job-card">
                  <div className="job-card-top">
                    <div className="job-header">
                      <div>
                        <h2 className="job-title">{job.title}</h2>
                        <p className="job-company">{job.company}</p>
                      </div>

                      <div className="job-meta">
                        <span className="meta-pill">Location: {job.location}</span>
                        <span className="meta-pill">CV upload enabled</span>
                      </div>
                    </div>

                    <p className="job-description">{job.description}</p>
                  </div>

                  <form
                    className="apply-panel"
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleApply(job._id);
                    }}
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="field-label md:col-span-2">
                        Cover letter
                        <textarea
                          value={application.coverLetter}
                          onChange={(event) =>
                            updateDraft(job._id, { coverLetter: event.target.value })
                          }
                          className="field-input min-h-32 resize-none"
                          placeholder="Write a short note about why you are a fit"
                        />
                      </label>

                      <label className="field-label md:col-span-2">
                        Upload CV
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(event) =>
                            updateDraft(job._id, {
                              cvFile: event.target.files?.[0] ?? null,
                            })
                          }
                          className="field-input"
                        />
                      </label>
                    </div>

                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="helper-row">
                        <span>
                          {application.cvFile ? `Selected: ${application.cvFile.name}` : "No CV selected yet"}
                        </span>
                        <span>Accepted formats: PDF, DOC, DOCX</span>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingJobId === job._id}
                        className="primary-action w-full sm:w-auto"
                      >
                        {submittingJobId === job._id ? "Submitting..." : "Apply now"}
                      </button>
                    </div>
                  </form>
                </article>
              );
            })}
          </div>

          <aside className="sidebar-panel">
            <div className="info-card">
              <p className="section-kicker text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Application tips
              </p>
              <h3 className="info-title">Make every application feel intentional.</h3>

              <div className="info-list">
                {applicationTips.map((tip, index) => (
                  <div key={tip} className="info-item">
                    <div className="info-badge">0{index + 1}</div>
                    <p className="info-text">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-card">
              <p className="section-kicker text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                Submission rules
              </p>
              <h3 className="info-title">Keep your file clean and readable.</h3>
              <p className="muted-copy leading-7 text-slate-600">
                PDF, DOC, and DOCX files are supported. Use a filename that clearly identifies you so
                recruiters can find it quickly.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}