import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Register from "../pages/auth/Register";

function Home() {
  return <h1>Welcome to CareerSync AI 🚀</h1>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}