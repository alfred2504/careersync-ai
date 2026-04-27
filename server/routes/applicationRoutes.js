import express from "express";
import Application from "../models/Application.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// APPLY TO JOB (Protected)
router.post("/", protect, async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    const existing = await Application.findOne({
      job: jobId,
      user: req.user._id,
    });

    if (existing) {
      return res.status(400).json({ message: "Already applied" });
    }

    const application = await Application.create({
      job: jobId,
      user: req.user._id,
      coverLetter,
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to apply" });
  }
});

// ✅ GET APPLICATIONS FOR A JOB (Protected)
router.get("/:jobId", protect, async (req, res) => {
  try {
    const applications = await Application.find({
      job: req.params.jobId,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

export default router;