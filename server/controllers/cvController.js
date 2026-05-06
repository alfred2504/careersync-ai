import fs from "fs";
import path from "path";
import { analyzeCVContent } from "./aiController.js";

export const analyzeCvUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CV file is required" });
    }

    const allowedTextTypes = ["text/plain", "text/html"];
    const mimetype = req.file.mimetype || "";

    if (!allowedTextTypes.includes(mimetype)) {
      return res.status(400).json({ message: "Unsupported file type for CV analysis" });
    }

    const filePath = path.resolve(req.file.path);
    const cvText = fs.readFileSync(filePath, "utf8");

    const jobDescription = req.body.jobDescription || "";

    const analysis = await analyzeCVContent(cvText, jobDescription);

    res.json({ success: true, analysis });
  } catch (error) {
    console.error("CV upload analysis error:", error);
    res.status(500).json({ message: error.message || "Failed to analyze CV" });
  }
};