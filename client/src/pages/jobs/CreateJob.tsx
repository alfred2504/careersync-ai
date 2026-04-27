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
    <div className="register-page">
      <form onSubmit={handleSubmit} className="register-card">
        <h2 className="register-title">Post Job</h2>

        <input
          name="title"
          placeholder="Job Title"
          className="register-input"
          onChange={handleChange}
        />

        <input
          name="company"
          placeholder="Company"
          className="register-input"
          onChange={handleChange}
        />

        <input
          name="location"
          placeholder="Location"
          className="register-input"
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Job Description"
          className="register-input"
          onChange={handleChange}
        />

        <button className="register-button">
          Post Job
        </button>
      </form>
    </div>
  );
}