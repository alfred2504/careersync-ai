import { Navigate, Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Jobs from "../pages/Jobs";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import AIInsights from "../pages/AIInsights";
import JobDetails from "../pages/JobDetails.tsx";
import AdminJobs from "../pages/admin/AdminJobs";
import AdminPostJob from "../pages/admin/AdminPostJob";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<Navigate to="/admin/jobs" replace />} />
      <Route path="/" element={<Landing />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/job/:id" element={<JobDetails />} />
      <Route path="/ai-insights" element={<AIInsights />} />
      <Route path="/analyzer" element={<AIInsights />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/jobs" element={<AdminJobs />} />
      <Route path="/admin/jobs/new" element={<AdminPostJob />} />
    </Routes>
  );
}
