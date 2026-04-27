import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import CreateJob from "../pages/jobs/CreateJob";
import Jobs from "../pages/jobs/Jobs";
import JobApplications from "../pages/jobs/JobApplications";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Jobs />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

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
      </Routes>
    </Router>
  );
}