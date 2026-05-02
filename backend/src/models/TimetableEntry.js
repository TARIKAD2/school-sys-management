const mongoose = require("mongoose");

const TimetableEntrySchema = new mongoose.Schema(
  {
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true, index: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: false, index: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6, index: true }, // 0 Sunday
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true }, // HH:mm
    room: { type: String, trim: true },
  },
  { timestamps: true }
);

TimetableEntrySchema.index(
  { class: 1, dayOfWeek: 1, startTime: 1, endTime: 1, module: 1 },
  { unique: true }
);

const TimetableEntry = mongoose.model("TimetableEntry", TimetableEntrySchema);

module.exports = { TimetableEntry };

