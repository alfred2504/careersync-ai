import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";

import CreateJob from "../pages/jobs/CreateJob";
import Jobs from "../pages/jobs/Jobs";
import JobApplications from "../pages/jobs/JobApplications";
import AdminJobs from "../pages/admin/AdminJobs";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* PROTECTED */}
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post-job"
          element={
            <ProtectedRoute>
              <CreateJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/job/:jobId/applications"
          element={
            <ProtectedRoute>
              <JobApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute>
              <AdminJobs />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}