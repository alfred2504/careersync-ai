import { useEffect, useState } from "react";
import { getJobs } from "../../services/jobService";
import { applyToJob } from "../../services/applicationService";

type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
};

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const handleApply = async (jobId: string) => {
    try {
      const res = await applyToJob({ jobId });
      alert(res.message);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error applying");
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
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Available Jobs</h2>

      {jobs.length === 0 && <p>No jobs available</p>}

      <div className="flex flex-col gap-4">
        {jobs.map((job) => (
          <div key={job._id} className="border p-4 rounded">
            <h3 className="font-bold">{job.title}</h3>
            <p>{job.company}</p>
            <p>{job.location}</p>
            <p>{job.description}</p>

            <button
              onClick={() => handleApply(job._id)}
              className="bg-blue-500 text-white p-2 mt-2"
            >
              Apply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}