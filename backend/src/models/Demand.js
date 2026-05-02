const mongoose = require("mongoose");

const DemandSchema = new mongoose.Schema(
  {
    // Student recipient (required for student demands)
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", index: true },
    // Teacher recipient (for teacher-targeted messages)
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", index: true },
    // Whether message is for student or teacher
    recipientType: { type: String, enum: ["student", "teacher"], default: "student" },
    secretary: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, default: "Please come to the administration office as soon as possible." },
    status: { type: String, enum: ["pending", "read", "completed"], default: "pending" },
    // Users who have read this message (by user _id)
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Demand = mongoose.model("Demand", DemandSchema);

module.exports = { Demand };
