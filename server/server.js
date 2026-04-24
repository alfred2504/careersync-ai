import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";   // ✅ ADD THIS

dotenv.config();

const app = express();

// connect database
connectDB();   // ✅ ADD THIS

// middleware
app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["jobSeeker", "jobPoster", "admin"],
      default: "jobSeeker",
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
      required: true,
    },
    salaryMin: {
      type: Number,
      required: true,
    },
    salaryMax: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const allowedRoles = ["jobSeeker", "jobPoster", "admin"];
    const normalizedRole = allowedRoles.includes(role) ? role : "jobSeeker";

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database is not connected." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Registration successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    return res.status(500).json({ message: "Registration failed." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database is not connected." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role || "jobSeeker" },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "jobSeeker",
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Login failed." });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database is not connected." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        message: "If an account exists, reset instructions were sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    const response = {
      message: "If an account exists, reset instructions were sent.",
    };

    if (process.env.NODE_ENV !== "production") {
      response.debugResetToken = resetToken;
      response.debugResetExpires = resetExpires.toISOString();
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Forgot password error:", error.message);
    return res.status(500).json({ message: "Could not process forgot password request." });
  }
});

app.get("/api/jobs", async (req, res) => {
  try {
    const {
      search,
      location,
      jobType,
      minSalary,
      maxSalary,
      featured,
      page = 1,
      limit = 12,
    } = req.query;

    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);

    const filter = { isActive: true };

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { title: regex },
        { company: regex },
        { description: regex },
      ];
    }

    if (location) {
      filter.location = new RegExp(location, "i");
    }

    if (jobType) {
      filter.jobType = jobType;
    }

    if (featured === "true") {
      filter.isFeatured = true;
    }

    if (minSalary || maxSalary) {
      const salaryMinNum = Number(minSalary || 0);
      const salaryMaxNum = Number(maxSalary || Number.MAX_SAFE_INTEGER);
      filter.salaryMax = { $gte: salaryMinNum };
      filter.salaryMin = { $lte: salaryMaxNum };
    }

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit);

    return res.status(200).json({
      jobs,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total,
        totalPages: Math.max(Math.ceil(total / numericLimit), 1),
      },
    });
  } catch (error) {
    console.error("List jobs error:", error.message);
    return res.status(500).json({ message: "Could not fetch jobs." });
  }
});

app.get("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job || !job.isActive) {
      return res.status(404).json({ message: "Job not found." });
    }

    return res.status(200).json({ job });
  } catch (error) {
    console.error("Get job details error:", error.message);
    return res.status(500).json({ message: "Could not fetch job details." });
  }
});

app.post("/api/jobs", async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      jobType,
      salaryMin,
      salaryMax,
      description,
      requirements,
      tags,
      isFeatured,
    } = req.body;

    if (!title || !company || !location || !jobType || !description) {
      return res.status(400).json({ message: "Missing required fields for job posting." });
    }

    if (salaryMin == null || salaryMax == null || Number(salaryMin) > Number(salaryMax)) {
      return res.status(400).json({ message: "Invalid salary range." });
    }

    const job = await Job.create({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      jobType,
      salaryMin: Number(salaryMin),
      salaryMax: Number(salaryMax),
      description: description.trim(),
      requirements: Array.isArray(requirements) ? requirements : [],
      tags: Array.isArray(tags) ? tags : [],
      isFeatured: Boolean(isFeatured),
    });

    return res.status(201).json({ message: "Job created successfully.", job });
  } catch (error) {
    console.error("Create job error:", error.message);
    return res.status(500).json({ message: "Could not create job." });
  }
});

app.post("/api/jobs/seed-demo", async (req, res) => {
  try {
    const count = await Job.countDocuments();
    if (count > 0) {
      return res.status(200).json({ message: "Jobs already exist. Skipping seed." });
    }

    const demoJobs = [
      {
        title: "Frontend Developer",
        company: "Harare Digital Labs",
        location: "Harare, Zimbabwe",
        jobType: "Full-time",
        salaryMin: 600,
        salaryMax: 1200,
        description: "Build responsive React interfaces for local fintech and e-commerce clients.",
        requirements: ["React", "TypeScript", "REST APIs"],
        tags: ["React", "Frontend"],
        isFeatured: true,
      },
      {
        title: "Backend Engineer",
        company: "Bulawayo Cloud Systems",
        location: "Bulawayo, Zimbabwe",
        jobType: "Full-time",
        salaryMin: 800,
        salaryMax: 1500,
        description: "Design and maintain Node.js APIs for hiring and payroll platforms.",
        requirements: ["Node.js", "MongoDB", "Express"],
        tags: ["Node", "API"],
        isFeatured: false,
      },
      {
        title: "UI/UX Intern",
        company: "Mutare Product Studio",
        location: "Mutare, Zimbabwe",
        jobType: "Internship",
        salaryMin: 200,
        salaryMax: 400,
        description: "Support design research and prototype screens for mobile-first job seeker tools.",
        requirements: ["Figma", "User Research"],
        tags: ["Design", "Internship"],
        isFeatured: true,
      },
    ];

    await Job.insertMany(demoJobs);
    return res.status(201).json({ message: "Demo jobs seeded successfully." });
  } catch (error) {
    console.error("Seed jobs error:", error.message);
    return res.status(500).json({ message: "Could not seed demo jobs." });
  }
});

// test route
app.get("/", (req, res) => {
  res.json({ message: "CareerSync AI API is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});