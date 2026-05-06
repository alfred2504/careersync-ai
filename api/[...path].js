import serverless from "serverless-http";

import app from "../server/app.js";
import connectDB from "../server/config/db.js";

const handler = serverless(app);

export default async function apiHandler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error("Database connection error:", error.message);
    return res.status(503).json({
      message: "Database unavailable",
      details: error.message,
    });
  }

  return handler(req, res);
}