import { useEffect, useState } from "react";
import { getApplications } from "../../services/applicationService";
import { useParams } from "react-router-dom";

type Application = {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  coverLetter?: string;
  cvUrl?: string;
  cvOriginalName?: string;
};

export default function JobApplications() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!jobId || jobId.includes("{")) {
        console.warn("Invalid or missing jobId:", jobId);
        setApplications([]);
        setLoading(false);
        return;
      }

      try {
        const data = await getApplications(jobId);
        setApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
        setApplications([]);
      }
      setLoading(false);
    };

    fetchApplications();
  }, [jobId]);

  if (loading) return <p>Loading applications...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Applications</h2>

      {applications.length === 0 && <p>No applications yet</p>}

      <div className="flex flex-col gap-4">
        {applications.map((app) => (
          <div key={app._id} className="border p-4 rounded">
            <h3 className="font-bold">{app.user.name}</h3>
            <p>{app.user.email}</p>
            {app.coverLetter && <p>{app.coverLetter}</p>}
            {app.cvUrl && (
              <a
                href={app.cvUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {app.cvOriginalName || "View CV"}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}