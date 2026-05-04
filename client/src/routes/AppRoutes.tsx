import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/Dashboard";
import Landing from "../pages/Landing";
import ProtectedRoute from "../components/ProtectedRoute";
import ProtectedLayout from "../components/ProtectedLayout";

import CreateJob from "../pages/jobs/CreateJob";
import Jobs from "../pages/jobs/Jobs";
import AIAssistant from "../pages/AIAssistant";
import JobApplications from "../pages/jobs/JobApplications";
import AdminJobs from "../pages/admin/AdminJobs";
import AdminInvites from "../pages/admin/AdminInvites";
import JobListings from "../pages/JobListings";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* PROTECTED */}
        <Route
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/job-listings" element={<JobListings />} />
          <Route path="/post-job" element={<CreateJob />} />
          <Route path="/job/:jobId/applications" element={<JobApplications />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/invites" element={<AdminInvites />} />
          <Route path="/ai" element={<AIAssistant />} />
        </Route>
      </Routes>
    </Router>
  );
}