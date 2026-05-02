const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true, index: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    date: { type: Date, required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, // teacher/admin
  },
  { timestamps: true }
);

const Exam = mongoose.model("Exam", ExamSchema);

module.exports = { Exam };

