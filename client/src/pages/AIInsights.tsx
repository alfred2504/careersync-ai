import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import Footer from "../components/Footer";
import { getAuthUser } from "../services/authService";
import { analyzeCV, analyzeCVText } from "../services/cvService";

const stripSurroundingWhitespace = (value: string) => value.replace(/^\s+|\s+$/g, "");

const sections = [
  {
    title: "Key strengths",
    icon: "▣",
    description: "What recruiters are likely to notice first in your CV.",
  },
  {
    title: "Gaps to close",
    icon: "△",
    description: "Missing details or weak areas that may reduce your fit score.",
  },
  {
    title: "Action plan",
    icon: "◌",
    description: "Practical edits you can make before applying for jobs.",
  },
];

export default function AIInsights() {
  const user = getAuthUser();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const hasInput = useMemo(
    () => Boolean(cvFile || stripSurroundingWhitespace(cvText)),
    [cvFile, cvText]
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = event.target.files?.[0] || null;
    setCvFile(file);
    if (file) {
      setCvText("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!cvFile && !stripSurroundingWhitespace(cvText)) {
      setError("Upload a CV file or paste CV text before analyzing.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnalysis("");
      setFallbackUsed(false);

      const response = cvFile
        ? await analyzeCV(cvFile, stripSurroundingWhitespace(jobDescription) || undefined)
        : await analyzeCVText(stripSurroundingWhitespace(cvText), stripSurroundingWhitespace(jobDescription) || undefined);

      setAnalysis(response.analysis || response.error || "No analysis returned.");
      setFallbackUsed(Boolean(response.fallback));
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to analyze CV.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <section className="ai-hero">
        <div className="container ai-hero-grid">
          <div>
            <p className="section-kicker">AI Insights</p>
            <h1>Analyze your CV and get instant job-fit feedback.</h1>
            <p className="ai-hero-copy">
              Upload a resume or paste plain text and get strengths, gaps, and action items tailored to the role you want.
            </p>
            <div className="ai-hero-pills">
              <span>CV analyzer</span>
              <span>Match feedback</span>
              <span>Action plan</span>
            </div>
          </div>

          <div className="ai-hero-card">
            <h3>How it works</h3>
            <ul>
              <li>Upload your CV or paste the text.</li>
              <li>Add a target job description for better matching.</li>
              <li>Get AI feedback with fallback analysis if the API is unavailable.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container ai-content">
        <div className="ai-grid">
          <form className="ai-form-card" onSubmit={handleSubmit}>
            <div className="ai-form-header">
              <div>
                <p className="section-kicker">Analyzer</p>
                <h2>Review your CV</h2>
              </div>
              <span className="ai-badge">Logged in as {user.name}</span>
            </div>

            <label className="ai-field">
              <span>Upload CV file</span>
              <input className="search-input" type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleFileChange} />
            </label>

            <label className="ai-field">
              <span>Or paste CV text</span>
              <textarea
                className="search-input ai-textarea"
                placeholder="Paste your CV content here"
                value={cvText}
                onChange={(event) => {
                  setCvText(event.target.value);
                  if (event.target.value.trim()) {
                    setCvFile(null);
                  }
                }}
              />
            </label>

            <label className="ai-field">
              <span>Optional target job description</span>
              <textarea
                className="search-input ai-textarea"
                placeholder="Paste a job description to compare against your CV"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
              />
            </label>

            {error ? <p className="error-text ai-feedback">{error}</p> : null}

            <button type="submit" className="btn ai-submit" disabled={loading || !hasInput}>
              {loading ? "Analyzing..." : "Analyze CV"}
            </button>
            <p className="ai-note">Your results appear below after the analysis completes.</p>
          </form>

          <aside className="ai-side-column">
            {sections.map((section) => (
              <article key={section.title} className="ai-mini-card">
                <div className="ai-mini-icon">{section.icon}</div>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </article>
            ))}
          </aside>
        </div>

        <section className="ai-results-shell">
          <div className="ai-results-header">
            <div>
              <p className="section-kicker">Insights</p>
              <h2>AI feedback</h2>
            </div>
            {fallbackUsed ? <span className="ai-badge ai-badge-warn">Fallback analysis used</span> : null}
          </div>

          {analysis ? (
            <div className="ai-results-card">
              <pre>{analysis}</pre>
            </div>
          ) : (
            <div className="ai-empty-state">
              <h3>No analysis yet</h3>
              <p>Upload a CV or paste text to generate strengths, gaps, and improvement suggestions.</p>
            </div>
          )}
        </section>
      </section>

      <Footer />
    </div>
  );
}
