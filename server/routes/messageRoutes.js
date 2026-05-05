import express from "express";
import mongoose from "mongoose";
import ContactMessage from "../models/ContactMessage.js";
import Job from "../models/Job.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { jobId, jobTitle, name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    let resolvedJobId = undefined;
    let resolvedJobTitle = jobTitle;

    if (jobId) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }

      const job = await Job.findById(jobId).select("title");
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      resolvedJobId = jobId;
      resolvedJobTitle = jobTitle || job.title;
    }

    const createdMessage = await ContactMessage.create({
      job: resolvedJobId,
      jobTitle: resolvedJobTitle,
      name,
      email,
      phone,
      message,
    });

    res.status(201).json({
      message: "Message sent successfully",
      inquiry: createdMessage,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to send message" });
  }
});

export default router;
