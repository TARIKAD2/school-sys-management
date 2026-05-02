const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    instructions: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    points: {
      type: Number,
      default: 100,
    },
    fileUrl: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
