import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { requireDatabase } from "./middleware/databaseMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import adminInviteRoutes from "./routes/adminInviteRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

app.use("/api/auth", requireDatabase, authRoutes);
app.use("/api/user", requireDatabase, userRoutes);
app.use("/api/jobs", requireDatabase, jobRoutes);
app.use("/api/applications", requireDatabase, applicationRoutes);
app.use("/api/admin", requireDatabase, adminInviteRoutes);
app.use("/api/ai", requireDatabase, aiRoutes);

export default app;