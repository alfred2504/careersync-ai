import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
// Navbar rendered globally via AuthenticatedLayout
import Footer from "../components/Footer";
import { getAuthUser } from "../services/authService";
import { getJobById, getJobs, type Job as JobItem } from "../services/jobService";
import { applyForJob } from "../services/applicationService";
import { draftFormText } from "../services/aiService";
import { sendJobMessage } from "../services/messageService";


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
  const user = getAuthUser();
  const [job, setJob] = useState<JobItem | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyCoverLetter, setApplyCoverLetter] = useState("");
  const [applyCv, setApplyCv] = useState<File | null>(null);
  const [applyStatus, setApplyStatus] = useState("");
  const [applyError, setApplyError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [messageName, setMessageName] = useState("");
  const [messageEmail, setMessageEmail] = useState("");
  const [messagePhone, setMessagePhone] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messageStatus, setMessageStatus] = useState("");
  const [messageError, setMessageError] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isDraftingApplication, setIsDraftingApplication] = useState(false);
  const [isDraftingMessage, setIsDraftingMessage] = useState(false);
  const [draftError, setDraftError] = useState("");

  const overviewItems = useMemo(
    () =>
      job
        ? [
            { label: "Job Title", value: job.title },
            { label: "Job Type", value: job.employmentType || "Full time" },
            { label: "Category", value: job.category || "General" },
            { label: "Experience", value: job.experienceLevel || "Any level" },
            { label: "Offered Salary", value: formatMoney(job.salaryRange) },
            { label: "Location", value: job.location },
          ]
        : [],
    [job]
  );

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

  const draftContext = useMemo(
    () => ({
      jobTitle: job?.title || "",
      companyName: job?.company || "",
      jobDescription: job?.description || "",
      responsibilities: keyResponsibilities.join("\n"),
      skills: professionalSkills.join("\n"),
      candidateName: user?.name || "",
      candidateEmail: user?.email || "",
      candidatePhone: messagePhone,
      coverLetter: applyCoverLetter,
      message: messageBody,
    }),
    [applyCoverLetter, job, keyResponsibilities, messageBody, messagePhone, professionalSkills, user]
  );

  const tags = job?.tags?.length ? job.tags : [job?.employmentType || "Full time", job?.category || "General", job?.location || "Zimbabwe"];

  const handleApplySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!job?._id) {
      return;
    }

    try {
      setIsApplying(true);
      setApplyError("");
      setApplyStatus("");

      const response = await applyForJob({
        jobId: job._id,
        coverLetter: applyCoverLetter,
        cv: applyCv,
      });

      setApplyStatus(response?.message || "Application submitted successfully");
      setApplyCoverLetter("");
      setApplyCv(null);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message || "Failed to submit application"
        : error instanceof Error
          ? error.message
          : "Failed to submit application";
      setApplyError(message);
    } finally {
      setIsApplying(false);
    }
  };

  const handleCvChange = (event: ChangeEvent<HTMLInputElement>) => {
    setApplyCv(event.target.files?.[0] || null);
  };

  const applySuggestedContact = (drafts: {
    suggestedName?: string;
    suggestedEmail?: string;
    suggestedPhone?: string;
  }) => {
    if (!messageName && drafts.suggestedName) {
      setMessageName(drafts.suggestedName);
    }

    if (!messageEmail && drafts.suggestedEmail) {
      setMessageEmail(drafts.suggestedEmail);
    }

    if (!messagePhone && drafts.suggestedPhone) {
      setMessagePhone(drafts.suggestedPhone);
    }
  };

  const handleDraftApplication = async () => {
    if (!job?._id) {
      return;
    }

    try {
      setIsDraftingApplication(true);
      setDraftError("");

      const response = await draftFormText(draftContext);
      if (response.drafts.coverLetter) {
        setApplyCoverLetter(response.drafts.coverLetter);
      }

      applySuggestedContact(response.drafts);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to draft application text";
      setDraftError(message);
    } finally {
      setIsDraftingApplication(false);
    }
  };

  const handleDraftMessage = async () => {
    if (!job?._id) {
      return;
    }

    try {
      setIsDraftingMessage(true);
      setDraftError("");

      const response = await draftFormText(draftContext);
      applySuggestedContact(response.drafts);

      if (response.drafts.message) {
        setMessageBody(response.drafts.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to draft message text";
      setDraftError(message);
    } finally {
      setIsDraftingMessage(false);
    }
  };

  const handleMessageSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!job?._id) {
      return;
    }

    try {
      setIsSendingMessage(true);
      setMessageError("");
      setMessageStatus("");

      const response = await sendJobMessage({
        jobId: job._id,
        jobTitle: job.title,
        name: messageName,
        email: messageEmail,
        phone: messagePhone,
        message: messageBody,
      });

      setMessageStatus(response?.message || "Message sent successfully");
      setMessageName("");
      setMessageEmail("");
      setMessagePhone("");
      setMessageBody("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send message";
      setMessageError(message);
    } finally {
      setIsSendingMessage(false);
    }
  };



  return (
    <div className="jobs-page">
      
      <section className="jobs-hero">
        <div className="jobs-hero-inner">
          <span className="job-details-breadcrumb">
            <Link to="/jobs">Jobs</Link> / Job Details
          </span>
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
              <div className="job-details-header-card">
                <span className="job-card-posted">{formatPostedTime(job.createdAt)}</span>
                <div className="job-details-header-row">
                  <div className="job-company-icon job-details-company-icon">
                    {job.company.trim().charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <h2 className="job-details-title">{job.title}</h2>
                    <p className="job-details-company">{job.company}</p>
                  </div>
                </div>

                <div className="job-card-meta job-details-meta">
                  <span className="job-card-meta-chip">{job.category || "General"}</span>
                  <span className="job-card-meta-chip">{job.employmentType || "Full time"}</span>
                  <span className="job-card-meta-chip">{formatMoney(job.salaryRange)}</span>
                  <span className="job-card-meta-chip">{job.location}</span>
                </div>
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
                <div className="share-row">
                  <span className="job-card-meta-chip">Facebook</span>
                  <span className="job-card-meta-chip">X</span>
                  <span className="job-card-meta-chip">LinkedIn</span>
                </div>
              </section>
            </main>

            <aside className="job-details-sidebar">
              <div className="detail-card">
                <h3>Apply Job</h3>
                {user ? (
                  <button className="btn" type="button" onClick={handleDraftApplication} disabled={isDraftingApplication} style={{ marginBottom: "0.75rem" }}>
                    {isDraftingApplication ? "Drafting..." : "Draft cover letter with AI"}
                  </button>
                ) : null}
                <form className="message-form" onSubmit={handleApplySubmit}>
                  <input
                    className="search-input"
                    type="file"
                    onChange={handleCvChange}
                  />
                  <textarea
                    className="search-input message-area"
                    placeholder="Write a short cover letter"
                    value={applyCoverLetter}
                    onChange={(event) => setApplyCoverLetter(event.target.value)}
                  />
                  <button className="btn" type="submit" disabled={isApplying}>
                    {isApplying ? "Submitting..." : "Apply Job"}
                  </button>
                </form>
                {applyStatus ? <p className="detail-card-note success-text">{applyStatus}</p> : null}
                {applyError ? <p className="detail-card-note error-text">{applyError}</p> : null}
                {draftError ? <p className="detail-card-note error-text">{draftError}</p> : null}
                <p className="detail-card-note">
                  Start your application using the latest job information from the database.
                </p>
              </div>

              <div className="detail-card">
                <h3>Job Overview</h3>
                <ul className="overview-list">
                  {overviewItems.map((item) => (
                    <li key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </li>
                  ))}
                </ul>
                <div className="map-preview">
                  <div className="map-dot" />
                  <span>{job.location}</span>
                </div>
              </div>

              <div className="detail-card">
                <h3>Send Us Message</h3>
                {user ? (
                  <button className="btn" type="button" onClick={handleDraftMessage} disabled={isDraftingMessage} style={{ marginBottom: "0.75rem" }}>
                    {isDraftingMessage ? "Drafting..." : "Draft message with AI"}
                  </button>
                ) : null}
                <form className="message-form" onSubmit={handleMessageSubmit}>
                  <input
                    className="search-input"
                    type="text"
                    placeholder="Full name"
                    value={messageName}
                    onChange={(event) => setMessageName(event.target.value)}
                  />
                  <input
                    className="search-input"
                    type="email"
                    placeholder="Email Address"
                    value={messageEmail}
                    onChange={(event) => setMessageEmail(event.target.value)}
                  />
                  <input
                    className="search-input"
                    type="text"
                    placeholder="Phone Number"
                    value={messagePhone}
                    onChange={(event) => setMessagePhone(event.target.value)}
                  />
                  <textarea
                    className="search-input message-area"
                    placeholder="Your Message"
                    value={messageBody}
                    onChange={(event) => setMessageBody(event.target.value)}
                  />
                  <button className="btn" type="submit" disabled={isSendingMessage}>
                    {isSendingMessage ? "Sending..." : "Send Message"}
                  </button>
                </form>
                {messageStatus ? <p className="detail-card-note success-text">{messageStatus}</p> : null}
                {messageError ? <p className="detail-card-note error-text">{messageError}</p> : null}
                {draftError ? <p className="detail-card-note error-text">{draftError}</p> : null}
              </div>
            </aside>
          </div>
        ) : null}
      </section>

      <section className="related-jobs-section container">
        <h2>Related Jobs</h2>
        <p>Jobs from the database that match the same company or location.</p>

        <div className="related-jobs-grid">
          {relatedJobs.length > 0 ? (
            relatedJobs.map((relatedJob) => (
              <article key={relatedJob._id} className="related-job-card">
                <span className="job-card-posted">{formatPostedTime(relatedJob.createdAt)}</span>
                <div className="job-card-header">
                  <div className="job-company-icon">
                    {relatedJob.company.trim().charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="job-card-info">
                    <h3>{relatedJob.title}</h3>
                    <p>{relatedJob.company}</p>
                  </div>
                </div>
                <div className="job-card-meta related-job-meta">
                  <span className="job-card-meta-chip">{relatedJob.category || "General"}</span>
                  <span className="job-card-meta-chip">{relatedJob.employmentType || "Full time"}</span>
                  <span className="job-card-meta-chip">{relatedJob.location}</span>
                </div>
                <p className="related-job-snippet">
                  {relatedJob.description.length > 110
                    ? `${relatedJob.description.slice(0, 110)}...`
                    : relatedJob.description}
                </p>
                <Link className="btn" to={`/jobs/${relatedJob._id}`}>
                  Job Details
                </Link>
              </article>
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
