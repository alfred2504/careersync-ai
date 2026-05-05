import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: "General" },
    employmentType: { type: String, default: "Full time" },
    salaryRange: { type: String, default: "Negotiable" },
    experienceLevel: { type: String, default: "Any level" },
    tags: [{ type: String }],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ✅ ADD STATUS
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;