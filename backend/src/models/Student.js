const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    studentId: { type: String, required: true, unique: true, index: true, trim: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: false, index: true },
    dateOfBirth: { type: Date },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    discountType: { type: String, enum: ["none", "percentage", "fixed"], default: "none" },
    discountValue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", StudentSchema);

module.exports = { Student };

