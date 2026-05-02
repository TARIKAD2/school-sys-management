const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: false, index: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: false, index: true },
  },
  { timestamps: true }
);

const ModuleModel = mongoose.model("Module", ModuleSchema);

module.exports = { ModuleModel };

