import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  analyzeCV,
  draftFormText,
  draftJobPost,
  generateCoverLetter,
  generateJobDescription,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/analyze-cv", protect, analyzeCV);
router.post("/generate-cover-letter", protect, generateCoverLetter);
router.post("/generate-job-description", protect, generateJobDescription);
router.post("/draft-form-text", draftFormText);
router.post("/draft-job-post", protect, draftJobPost);

export default router;
