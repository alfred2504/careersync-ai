import { useState } from "react";
import { createJob } from "../../services/jobService";

export default function CreateJob() {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await createJob(form);
      alert(data.message);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="app-shell">
      <div className="page-frame">
        <section className="page-hero">
          <span className="section-chip">Hiring</span>
          <h1 className="page-title">Publish a role with a clean, professional flow.</h1>
          <p className="page-subtitle">
            Keep the form simple for recruiters while presenting the job in a polished format.
          </p>
        </section>

        <div className="page-grid" style={{ gridTemplateColumns: "1fr" }}>
          <form onSubmit={handleSubmit} className="info-card space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="field-label">
                Job title
                <input
                  name="title"
                  placeholder="Senior Product Designer"
                  className="field-input"
                  onChange={handleChange}
                />
              </label>

              <label className="field-label">
                Company
                <input
                  name="company"
                  placeholder="CareerSync AI"
                  className="field-input"
                  onChange={handleChange}
                />
              </label>

              <label className="field-label md:col-span-2">
                Location
                <input
                  name="location"
                  placeholder="Remote / Harare / Hybrid"
                  className="field-input"
                  onChange={handleChange}
                />
              </label>

              <label className="field-label md:col-span-2">
                Description
                <textarea
                  name="description"
                  placeholder="Describe the role, responsibilities, and the ideal candidate"
                  className="field-input min-h-40 resize-none"
                  onChange={handleChange}
                />
              </label>
            </div>

            <button className="primary-action w-full sm:w-auto">
              Post Job
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}