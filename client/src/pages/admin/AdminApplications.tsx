import { useEffect, useState } from "react";
import { getAllJobs } from "../../services/jobService";
import { getApplications, updateApplicationStatus } from "../../services/applicationService";

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

  return (
    <div className="site-card">
      <h2>Manage Applications</h2>

      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Select job:</label>
        <select
          value={selectedJobId || ""}
          onChange={(e) => setSelectedJobId(e.target.value)}
        >
          {jobs.map((j) => (
            <option key={j._id} value={j._id}>{j.title} — {j.company}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading applications...</p>
      ) : (
        <div>
          {applications.length === 0 ? (
            <p>No applications for this job.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {applications.map((a) => (
                <li key={a._id} style={{ borderBottom: "1px solid #eee", padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <strong>{a.user?.name || "Unknown"}</strong> &lt;{a.user?.email}&gt;
                      <div style={{ marginTop: 8 }}>{a.coverLetter || "(no cover letter)"}</div>
                      <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                        CV: {a.cvOriginalName || "(none)"} — Status: {a.status}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {a.status !== "accepted" && (
                        <button onClick={() => handleStatus(a._id, "accepted")}>Approve</button>
                      )}
                      {a.status !== "rejected" && (
                        <button onClick={() => handleStatus(a._id, "rejected")}>Reject</button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
