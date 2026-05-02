const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, index: true },
    level: { type: String, trim: true, index: true }, // e.g. "Grade 10"
    academicYear: { type: String, trim: true, index: true }, // e.g. "2026/2027"
    homeroomTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: false },
  },
  { timestamps: true }
);

const ClassModel = mongoose.model("Class", ClassSchema);

module.exports = { ClassModel };

