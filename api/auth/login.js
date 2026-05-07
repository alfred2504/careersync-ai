import connectDB from "../../server/config/db.js";
import { login } from "../../server/controllers/authController.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();
  } catch (error) {
    return res.status(503).json({
      message: "Database unavailable",
      details: error.message,
    });
  }

  try {
    await login(req, res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}
