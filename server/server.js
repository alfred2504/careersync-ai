import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { requireDatabase } from "./middleware/databaseMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "uploads");
const clientDistDir = path.resolve(__dirname, "..", "client", "dist");
const clientIndexFile = path.join(clientDistDir, "index.html");

fs.mkdirSync(uploadsDir, { recursive: true });

// connect DB
connectDB();

// middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// routes
app.use("/api/auth", requireDatabase, authRoutes);
app.use("/api/user", requireDatabase, userRoutes);
app.use("/api/jobs", requireDatabase, jobRoutes);
app.use("/api/applications", requireDatabase, applicationRoutes);
app.use("/api/ai", requireDatabase, aiRoutes);

if (fs.existsSync(clientDistDir)) {
  app.use(express.static(clientDistDir));

  app.get(/^(?!\/api).*/, (req, res) => {
    if (fs.existsSync(clientIndexFile)) {
      res.sendFile(clientIndexFile);
      return;
    }

    res.status(404).json({ message: "Client build not found" });
  });
}

// test route
app.get("/", (req, res) => {
  res.json({ message: "CareerSync AI API is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});