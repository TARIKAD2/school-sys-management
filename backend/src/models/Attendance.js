const mongoose = require("mongoose");

const AttendanceRecordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    status: { type: String, enum: ["present", "absent", "late"], required: true, default: "present" },
    note: { type: String, trim: true },
    absenceTime: { type: String, trim: true }, // e.g. "08:30"
    absenceType: { type: String, trim: true }, // e.g. "Justified", "Medical"
  },
  { _id: false }
);

const AttendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: false, index: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    records: { type: [AttendanceRecordSchema], default: [] },
  },
  { timestamps: true }
);

AttendanceSchema.index({ date: 1, class: 1, module: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", AttendanceSchema);

module.exports = { Attendance };

