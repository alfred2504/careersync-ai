import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import multer from "multer";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const uploadsDir = path.resolve("uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeOriginalName = path.basename(file.originalname).replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${safeOriginalName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
    }

    cb(null, true);
  },
});

const handleCvUpload = (req, res, next) => {
  upload.single("cv")(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    next();
  });
};

// APPLY TO JOB (Protected)
router.post("/", protect, handleCvUpload, async (req, res) => {
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
      cvUrl: req.file
        ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
        : undefined,
      cvOriginalName: req.file?.originalname,
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
    if (!mongoose.Types.ObjectId.isValid(req.params.jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const job = await Job.findById(req.params.jobId).select("createdBy");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const isOwner = String(job.createdBy) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You can only view applications for jobs you posted",
      });
    }

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

// ✅ UPDATE APPLICATION STATUS (Poster/Admin only)
router.put("/:applicationId/status", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.applicationId)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }

    const { status } = req.body;
    const allowedStatuses = ["accepted", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid application status" });
    }

    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const job = await Job.findById(application.job).select("createdBy");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const isOwner = String(job.createdBy) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You can only update applications for jobs you posted",
      });
    }

    application.status = status;
    await application.save();

    const updatedApplication = await Application.findById(application._id).populate(
      "user",
      "name email"
    );

    return res.json({
      message: `Application ${status}`,
      application: updatedApplication,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update application" });
  }
});

export default router;