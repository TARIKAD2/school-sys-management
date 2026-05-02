const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    type: { type: String, enum: ["attendance", "grades", "general"], required: true, default: "general", index: true },
    periodStart: { type: Date },
    periodEnd: { type: Date },
    summary: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", ReportSchema);

module.exports = { Report };

