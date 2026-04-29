import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  analyzeCV,
  generateCoverLetter,
  generateJobDescription,
} from "../controllers/aiController.js";

const router = express.Router();

// All AI endpoints require authentication
router.post("/analyze-cv", protect, analyzeCV);
router.post("/generate-cover-letter", protect, generateCoverLetter);
router.post("/generate-job-description", protect, generateJobDescription);

export default router;
