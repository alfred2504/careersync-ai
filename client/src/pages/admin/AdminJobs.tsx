import { useEffect, useState } from "react";
import { getAllJobs, updateJobStatus } from "../../services/jobService";

export default function AdminJobs() {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const data = await getAllJobs();
      setJobs(data);
    };

    fetch();
  }, []);

  const handleStatus = async (id: string, status: string) => {
    await updateJobStatus(id, status);
    window.location.reload();
  };

  return (
    <div>
      <h2>Admin Jobs</h2>

      {jobs.map((job) => (
        <div key={job._id}>
          <p>{job.title}</p>
          <button onClick={() => handleStatus(job._id, "approved")}>
            Approve
          </button>
          <button onClick={() => handleStatus(job._id, "rejected")}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}