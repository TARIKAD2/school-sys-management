const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
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
    content: {
      type: String, // Description or text content
    },
    fileUrl: {
      type: String,
    },
    fileType: {
      type: String,
      enum: ["pdf", "video", "image", "doc", "link"],
      default: "pdf",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
