import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function ProtectedLayout() {
  return (
    <div className="protected-layout">
      <Navbar />
      <main className="protected-content">
        <Outlet />
      </main>
    </div>
  );
}