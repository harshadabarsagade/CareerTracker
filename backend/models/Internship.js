import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      default: "",
    },
    workMode: {
      type: String,
      enum: ["Remote", "On-site", "Hybrid"],
      default: "Remote",
    },
    stipend: {
      type: Number,
      min: 0,
      default: 0,
    },
    applicationLink: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Applied", "Assessment", "Interview", "Offer", "Rejected"],
      default: "Applied",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    interviewDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Internship = mongoose.model("Internship", internshipSchema);

export default Internship;