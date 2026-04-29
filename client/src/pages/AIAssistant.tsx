import { useState } from "react";
import {
  analyzeCV,
  generateCoverLetter,
  generateJobDescription,
} from "../services/aiService";

type TabType = "cv-analysis" | "cover-letter" | "job-description";

export default function AIAssistant() {
  // navigation not used in this page
  const [activeTab, setActiveTab] = useState<TabType>("cv-analysis");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // CV Analysis state
  const [cvText, setCvText] = useState("");
  const [cvJobDesc, setCvJobDesc] = useState("");
  const [cvAnalysis, setCvAnalysis] = useState("");

  // Cover Letter state
  const [clJobTitle, setClJobTitle] = useState("");
  const [clCompany, setClCompany] = useState("");
  const [clJobDesc, setClJobDesc] = useState("");
  const [clCvHighlights, setClCvHighlights] = useState("");
  const [clTone, setClTone] = useState("professional");
  const [coverLetter, setCoverLetter] = useState("");

  // Job Description state
  const [jdJobTitle, setJdJobTitle] = useState("");
  const [jdCompany, setJdCompany] = useState("");
  const [jdDepartment, setJdDepartment] = useState("");
  const [jdSeniority, setJdSeniority] = useState("");
  const [jdResponsibilities, setJdResponsibilities] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const clearError = () => setError("");
  const clearSuccess = () => setSuccess("");

  const handleAnalyzeCV = async () => {
    clearError();
    clearSuccess();
    if (!cvText.trim()) {
      setError("Please enter your CV content");
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeCV(cvText, cvJobDesc);
      setCvAnalysis(result.analysis);
      setSuccess("CV analysis complete!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze CV");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    clearError();
    clearSuccess();
    if (!clJobTitle.trim() || !clCompany.trim()) {
      setError("Job title and company name are required");
      return;
    }

    setLoading(true);
    try {
      const result = await generateCoverLetter(
        clJobTitle,
        clCompany,
        clJobDesc,
        clCvHighlights,
        clTone
      );
      setCoverLetter(result.coverLetter);
      setSuccess("Cover letter generated!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateJobDescription = async () => {
    clearError();
    clearSuccess();
    if (!jdJobTitle.trim() || !jdCompany.trim()) {
      setError("Job title and company name are required");
      return;
    }

    setLoading(true);
    try {
      const result = await generateJobDescription(
        jdJobTitle,
        jdCompany,
        jdDepartment,
        jdSeniority,
        jdResponsibilities
      );
      setJobDescription(result.jobDescription);
      setSuccess("Job description generated!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate job description");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Copied to clipboard!");
    setTimeout(clearSuccess, 2000);
  };

  return (
    <div className="app-shell">
      <div className="protected-layout">
        <div className="page-frame">
          <div className="page-hero">
            <span className="section-chip">AI Assistant</span>
            <h1 className="page-title">CareerSync AI</h1>
            <p className="page-subtitle">
              Get AI-powered assistance for your career needs. Analyze CVs, write cover letters,
              and create job descriptions.
            </p>
          </div>

          <div className="ai-tabs-container">
            <div className="ai-tabs">
              <button
                className={`ai-tab ${activeTab === "cv-analysis" ? "active" : ""}`}
                onClick={() => setActiveTab("cv-analysis")}
              >
                <span className="tab-icon">📄</span>
                CV Analysis
              </button>
              <button
                className={`ai-tab ${activeTab === "cover-letter" ? "active" : ""}`}
                onClick={() => setActiveTab("cover-letter")}
              >
                <span className="tab-icon">✍️</span>
                Cover Letter
              </button>
              <button
                className={`ai-tab ${activeTab === "job-description" ? "active" : ""}`}
                onClick={() => setActiveTab("job-description")}
              >
                <span className="tab-icon">💼</span>
                Job Description
              </button>
            </div>
          </div>

          {(error || success) && (
            <div className="ai-alert-container">
              {error && (
                <div className="ai-alert ai-alert-error">
                  <span>{error}</span>
                  <button onClick={clearError} className="ai-alert-close">
                    ✕
                  </button>
                </div>
              )}
              {success && (
                <div className="ai-alert ai-alert-success">
                  <span>{success}</span>
                  <button onClick={clearSuccess} className="ai-alert-close">
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="ai-content">
            {/* CV Analysis Tab */}
            {activeTab === "cv-analysis" && (
              <div className="ai-tab-content">
                <div className="ai-input-section">
                  <label className="ai-label">
                    Your CV Content <span className="required">*</span>
                  </label>
                  <textarea
                    className="ai-textarea"
                    placeholder="Paste your CV content here (text or formatted)..."
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    rows={10}
                  />

                  <label className="ai-label">
                    Job Description <span className="optional">(optional)</span>
                  </label>
                  <textarea
                    className="ai-textarea"
                    placeholder="Paste the job description to get role-specific analysis..."
                    value={cvJobDesc}
                    onChange={(e) => setCvJobDesc(e.target.value)}
                    rows={6}
                  />

                  <button
                    className="primary-action"
                    onClick={handleAnalyzeCV}
                    disabled={loading}
                  >
                    {loading ? "Analyzing..." : "Analyze CV"}
                  </button>
                </div>

                {cvAnalysis && (
                  <div className="ai-output-section">
                    <div className="ai-output-header">
                      <h3>CV Analysis Results</h3>
                      <button
                        className="ai-copy-button"
                        onClick={() => copyToClipboard(cvAnalysis)}
                        title="Copy to clipboard"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <div className="ai-output-content">
                      {cvAnalysis.split("\n").map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cover Letter Tab */}
            {activeTab === "cover-letter" && (
              <div className="ai-tab-content">
                <div className="ai-input-section">
                  <div className="ai-input-row">
                    <div className="ai-input-col">
                      <label className="ai-label">
                        Job Title <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="ai-input"
                        placeholder="e.g., Senior Product Manager"
                        value={clJobTitle}
                        onChange={(e) => setClJobTitle(e.target.value)}
                      />
                    </div>
                    <div className="ai-input-col">
                      <label className="ai-label">
                        Company Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="ai-input"
                        placeholder="e.g., Tech Innovators Inc"
                        value={clCompany}
                        onChange={(e) => setClCompany(e.target.value)}
                      />
                    </div>
                  </div>

                  <label className="ai-label">
                    Job Description <span className="optional">(optional)</span>
                  </label>
                  <textarea
                    className="ai-textarea"
                    placeholder="Paste the job description to tailor the cover letter..."
                    value={clJobDesc}
                    onChange={(e) => setClJobDesc(e.target.value)}
                    rows={6}
                  />

                  <label className="ai-label">
                    Key Qualifications from CV <span className="optional">(optional)</span>
                  </label>
                  <textarea
                    className="ai-textarea"
                    placeholder="List your key skills and achievements..."
                    value={clCvHighlights}
                    onChange={(e) => setClCvHighlights(e.target.value)}
                    rows={4}
                  />

                  <label className="ai-label">Tone</label>
                  <select
                    className="ai-input"
                    value={clTone}
                    onChange={(e) => setClTone(e.target.value)}
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                    <option value="creative">Creative</option>
                  </select>

                  <button
                    className="primary-action"
                    onClick={handleGenerateCoverLetter}
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "Generate Cover Letter"}
                  </button>
                </div>

                {coverLetter && (
                  <div className="ai-output-section">
                    <div className="ai-output-header">
                      <h3>Generated Cover Letter</h3>
                      <button
                        className="ai-copy-button"
                        onClick={() => copyToClipboard(coverLetter)}
                        title="Copy to clipboard"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <div className="ai-output-content">
                      {coverLetter.split("\n").map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Job Description Tab */}
            {activeTab === "job-description" && (
              <div className="ai-tab-content">
                <div className="ai-input-section">
                  <div className="ai-input-row">
                    <div className="ai-input-col">
                      <label className="ai-label">
                        Job Title <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="ai-input"
                        placeholder="e.g., Senior Product Manager"
                        value={jdJobTitle}
                        onChange={(e) => setJdJobTitle(e.target.value)}
                      />
                    </div>
                    <div className="ai-input-col">
                      <label className="ai-label">
                        Company Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="ai-input"
                        placeholder="e.g., Tech Innovators Inc"
                        value={jdCompany}
                        onChange={(e) => setJdCompany(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="ai-input-row">
                    <div className="ai-input-col">
                      <label className="ai-label">
                        Department <span className="optional">(optional)</span>
                      </label>
                      <input
                        type="text"
                        className="ai-input"
                        placeholder="e.g., Product Management"
                        value={jdDepartment}
                        onChange={(e) => setJdDepartment(e.target.value)}
                      />
                    </div>
                    <div className="ai-input-col">
                      <label className="ai-label">
                        Seniority Level <span className="optional">(optional)</span>
                      </label>
                      <select
                        className="ai-input"
                        value={jdSeniority}
                        onChange={(e) => setJdSeniority(e.target.value)}
                      >
                        <option value="">Select Level</option>
                        <option value="Entry Level">Entry Level</option>
                        <option value="Mid-Level">Mid-Level</option>
                        <option value="Senior">Senior</option>
                        <option value="Lead">Lead</option>
                        <option value="Executive">Executive</option>
                      </select>
                    </div>
                  </div>

                  <label className="ai-label">
                    Key Responsibilities <span className="optional">(optional)</span>
                  </label>
                  <textarea
                    className="ai-textarea"
                    placeholder="List the main responsibilities for this role..."
                    value={jdResponsibilities}
                    onChange={(e) => setJdResponsibilities(e.target.value)}
                    rows={5}
                  />

                  <button
                    className="primary-action"
                    onClick={handleGenerateJobDescription}
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "Generate Job Description"}
                  </button>
                </div>

                {jobDescription && (
                  <div className="ai-output-section">
                    <div className="ai-output-header">
                      <h3>Generated Job Description</h3>
                      <button
                        className="ai-copy-button"
                        onClick={() => copyToClipboard(jobDescription)}
                        title="Copy to clipboard"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <div className="ai-output-content">
                      {jobDescription.split("\n").map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
