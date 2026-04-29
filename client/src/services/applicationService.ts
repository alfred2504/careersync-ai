import axios from "axios";
import API from "./api.js";

export const applyToJob = async (data: FormData) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(`${API}/applications`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// ✅ GET APPLICATIONS FOR A JOB
export const getApplications = async (jobId: string) => {
  const token = localStorage.getItem("token");

  try {
    const res = await axios.get(`${API}/applications/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (Array.isArray(res.data)) {
      return res.data;
    }

    if (Array.isArray(res.data?.applications)) {
      return res.data.applications;
    }

    return [];
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Failed to fetch applications"
    );
  }
};

export const updateApplicationStatus = async (applicationId: string, status: "accepted" | "rejected") => {
  const token = localStorage.getItem("token");

  try {
    const res = await axios.put(
      `${API}/applications/${applicationId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Failed to update application"
    );
  }
};