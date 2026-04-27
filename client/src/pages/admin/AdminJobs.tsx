import { useEffect, useState } from "react";
import { getAllJobs, updateJobStatus } from "../../services/jobService";

type Job = {
  _id: string;
  title: string;
  company: string;
  status: string;
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);

  const fetchJobs = async () => {
    try {
      const data = await getAllJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      setJobs([]);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleUpdate = async (id: string, status: string) => {
    await updateJobStatus(id, status);
    fetchJobs();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Admin Job Approval</h2>

      {jobs.map((job) => (
        <div key={job._id} className="border p-4 mb-3">
          <h3>{job.title}</h3>
          <p>{job.company}</p>
          <p>Status: {job.status}</p>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleUpdate(job._id, "approved")}
              className="bg-green-500 text-white p-2"
            >
              Approve
            </button>

            <button
              onClick={() => handleUpdate(job._id, "rejected")}
              className="bg-red-500 text-white p-2"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}