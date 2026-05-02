const { Teacher } = require("../models/Teacher");

async function teacherRBAC(req, res, next) {
  if (req.user.role !== "teacher") return next();

  try {
    const teacherDoc = await Teacher.findOne({ user: req.user._id });
    if (!teacherDoc) {
      return res.status(403).json({ message: "Teacher profile not found. Access denied." });
    }

    req.teacherAssignments = {
      classes: teacherDoc.assignedClasses.map(id => String(id)),
      modules: teacherDoc.assignedModules.map(id => String(id)),
      teacherId: teacherDoc._id
    };
    next();
  } catch (err) {
    console.error("RBAC Middleware Error:", err);
    res.status(500).json({ message: "Internal server error in RBAC" });
  }
}

module.exports = { teacherRBAC };
