import { useMemo, useState, type FormEvent } from "react";
// Using global authenticated sidebar instead of AdminLayout
import { createJob } from "../../services/jobService";
import { generateJobDescription } from "../../services/aiService";

const emptyForm = {
  title: "",
  company: "",
  location: "",
  description: "",
  category: "",
  employmentType: "",
  salaryRange: "",
  experienceLevel: "",
  tags: "",
  responsibilities: "",
  skills: "",
};

const splitList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function AdminPostJob() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = (field: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const payload = useMemo(
    () => ({
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      employmentType: form.employmentType.trim(),
      salaryRange: form.salaryRange.trim(),
      experienceLevel: form.experienceLevel.trim(),
      tags: splitList(form.tags),
      responsibilities: splitList(form.responsibilities),
      skills: splitList(form.skills),
    }),
    [form]
  );

  const handleDraftDescription = async () => {
    if (!form.title.trim() || !form.company.trim() || !form.location.trim()) {
      setError("Enter job title, company, and location before generating the description.");
      return;
    }

    try {
      setDrafting(true);
      setError("");
      setSuccess("");

      const response = await generateJobDescription({
        jobTitle: form.title,
        companyName: form.company,
        department: form.category,
        seniority: form.experienceLevel,
        keyResponsibilities: [form.description, form.responsibilities, form.skills]
          .map((value) => value.trim())
          .filter(Boolean)
          .join("\n"),
      });

      setForm((current) => ({
        ...current,
        description: response.jobDescription,
      }));
      setSuccess(response.fallback ? "AI description generated with fallback suggestions." : "AI description generated successfully.");
    } catch (draftError) {
      const message = draftError instanceof Error ? draftError.message : "Failed to generate job description.";
      setError(message);
    } finally {
      setDrafting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createJob(payload);
      setSuccess("Job posted successfully.");
      setForm(emptyForm);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to post job.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <section className="admin-page-header">
        <div>
          <p className="section-kicker">Jobs</p>
          <h1>Post a Job</h1>
          <p>Create a vacancy and publish it to the platform.</p>
        </div>
      </section>

      <section className="contact-card admin-form-card">
        <form className="contact-form admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-section">
            <div className="contact-row admin-form-grid">
            <label>
              Job Title
              <input className="search-input" value={form.title} onChange={(event) => updateField("title", event.target.value)} required />
            </label>
            <label>
              Company
              <input className="search-input" value={form.company} onChange={(event) => updateField("company", event.target.value)} required />
            </label>
            <label>
              Location
              <input className="search-input" value={form.location} onChange={(event) => updateField("location", event.target.value)} required />
            </label>
            <label>
              Category
              <input className="search-input" value={form.category} onChange={(event) => updateField("category", event.target.value)} />
            </label>
            <label>
              Employment Type
              <input className="search-input" value={form.employmentType} onChange={(event) => updateField("employmentType", event.target.value)} />
            </label>
            <label>
              Salary Range
              <input className="search-input" value={form.salaryRange} onChange={(event) => updateField("salaryRange", event.target.value)} />
            </label>
            <label>
              Experience Level
              <input className="search-input" value={form.experienceLevel} onChange={(event) => updateField("experienceLevel", event.target.value)} />
            </label>
          </div>
          </div>

          <div className="admin-form-section">
            <label>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", marginBottom: "0.5rem" }}>
              <span>Job Description</span>
              <button type="button" className="btn" onClick={handleDraftDescription} disabled={drafting}>
                {drafting ? "Generating..." : "Generate with AI"}
              </button>
            </div>
            <textarea className="search-input message-area admin-textarea" value={form.description} onChange={(event) => updateField("description", event.target.value)} required />
            </label>
          </div>

          <div className="admin-form-section">
            <div className="contact-row admin-form-grid">
            <label>
              Tags
              <input className="search-input" value={form.tags} onChange={(event) => updateField("tags", event.target.value)} placeholder="React, Remote, Full-time" />
            </label>
            <label>
              Responsibilities
              <input className="search-input" value={form.responsibilities} onChange={(event) => updateField("responsibilities", event.target.value)} placeholder="Build UI, Review code" />
            </label>
            <label>
              Skills
              <input className="search-input" value={form.skills} onChange={(event) => updateField("skills", event.target.value)} placeholder="TypeScript, Node.js" />
            </label>
          </div>
          </div>

          {error ? <p className="error-text admin-feedback">{error}</p> : null}
          {success ? <p className="success-text admin-feedback">{success}</p> : null}

          <div className="admin-form-actions">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Posting..." : "Post Job"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}