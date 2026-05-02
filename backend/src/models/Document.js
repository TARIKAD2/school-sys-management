const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["certificate", "contract", "report", "other"],
      default: "other",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Can be a student or teacher
      required: true,
    },
    visibility: [
      {
        type: String,
        enum: ["admin", "teacher", "student", "secretary"],
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
