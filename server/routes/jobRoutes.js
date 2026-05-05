import express from "express";
import Job from "../models/Job.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// CREATE JOB (Protected)
router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      description,
      category,
      employmentType,
      salaryRange,
      experienceLevel,
      tags,
      responsibilities,
      skills,
    } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const job = await Job.create({
      title,
      company,
      location,
      description,
      category,
      employmentType,
      salaryRange,
      experienceLevel,
      tags,
      responsibilities,
      skills,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create job" });
  }
});

// ✅ GET ALL JOBS (Public)
router.get("/", async (req, res) => {
  try {
    const { title, location } = req.query;

    const filter = {};

    if (title && typeof title === "string" && title.trim()) {
      const searchTerm = title.trim();
      filter.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { company: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (location && typeof location === "string" && location.trim()) {
      filter.location = { $regex: location.trim(), $options: "i" };
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// ✅ GET SINGLE JOB (Public)
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job" });
  }
});

// ✅ ADMIN: GET ALL JOBS
router.get("/admin/all", protect, isAdmin, async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// ✅ ADMIN: UPDATE JOB STATUS
router.put("/:id/status", protect, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({ message: "Job updated", job });
  } catch (error) {
    res.status(500).json({ message: "Failed to update job" });
  }
});

export default router;