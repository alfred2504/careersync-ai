import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";
import { analyzeCvUpload } from "../controllers/cvController.js";

const router = express.Router();

const uploadsDir = path.resolve("uploads");
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeOriginalName = path.basename(file.originalname).replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${safeOriginalName}`);
  },
});

const upload = multer({ storage });

router.post("/analyze", protect, upload.single("cv"), analyzeCvUpload);

export default router;
