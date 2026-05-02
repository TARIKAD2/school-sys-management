const mongoose = require("mongoose");

const GradeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true, index: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    comment: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, // teacher/admin
  },
  { timestamps: true }
);

GradeSchema.index({ student: 1, exam: 1 }, { unique: true });

const Grade = mongoose.model("Grade", GradeSchema);

module.exports = { Grade };

