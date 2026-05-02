const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    teacherId: { type: String, required: true, unique: true, index: true, trim: true },
    department: { type: String, trim: true },
    phone: { type: String, trim: true },
    assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    assignedModules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
  },
  { timestamps: true }
);

const Teacher = mongoose.model("Teacher", TeacherSchema);

module.exports = { Teacher };

