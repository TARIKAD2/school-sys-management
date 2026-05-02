const express = require("express");
const { z } = require("zod");
const { requireAuth, requireRole } = require("../middleware/auth");
const { teacherRBAC } = require("../middleware/rbac");
const { Attendance } = require("../models/Attendance");
const { Student } = require("../models/Student");
const { Teacher } = require("../models/Teacher");
const { parsePagination, parseSort, buildSearchFilter } = require("../utils/apiFeatures");

const router = express.Router();

const CreateSchema = z.object({
  date: z.string().min(1),
  classId: z.string().min(1),
  moduleId: z.string().optional(),
  teacherId: z.string().optional(),
});

router.get("/", requireAuth, requireRole("admin", "teacher", "student", "secretary"), teacherRBAC, async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query.sort || "-date");

  const filter = {};
  let studentDoc = null;

  if (req.query.classId) filter.class = String(req.query.classId);
  if (req.query.moduleId) filter.module = String(req.query.moduleId);

  if (req.user.role === "student") {
    studentDoc = await Student.findOne({ user: req.user._id });
    if (!studentDoc) return res.json({ items: [], page, limit, total: 0, pages: 0 });
    filter["records.student"] = studentDoc._id;
  } else if (req.user.role === "teacher") {
    // Only see attendance for assigned classes
    filter.class = { $in: req.teacherAssignments.classes };
    if (req.query.classId && !req.teacherAssignments.classes.includes(String(req.query.classId))) {
      return res.status(403).json({ message: "Access denied to this class" });
    }
  }

  const q = req.query.q ? String(req.query.q).trim() : "";
  const search = buildSearchFilter({ q, fields: [] });
  if (search) {
     Object.assign(filter, search);
  }

  const [items, total] = await Promise.all([
    Attendance.find(filter)
      .populate("class", "name")
      .populate("module", "code name")
      .populate("createdBy", "name email role")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(filter),
  ]);

  if (studentDoc) {
    const sId = studentDoc._id.toString();
    items.forEach((item) => {
      item.records = item.records.filter((r) => r.student.toString() === sId);
    });
  }

  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
});

router.post("/", requireAuth, requireRole("admin", "teacher", "secretary"), teacherRBAC, async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const { date, classId, moduleId, teacherId } = parsed.data;

  // RBAC for teacher
  if (req.user.role === "teacher") {
    if (!req.teacherAssignments.classes.includes(classId)) {
      return res.status(403).json({ message: "You can only mark attendance for assigned classes" });
    }
    if (moduleId && !req.teacherAssignments.modules.includes(moduleId)) {
      return res.status(403).json({ message: "You can only mark attendance for assigned modules" });
    }
  }

  const item = await Attendance.create({
    date: new Date(date),
    class: classId,
    module: moduleId || undefined,
    teacher: teacherId || (req.user.role === "teacher" ? req.teacherAssignments.teacherId : undefined),
    createdBy: req.user._id,
    records: [],
  });
  res.status(201).json({ item });
});

const UpsertRecordsSchema = z.object({
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.enum(["present", "absent", "late"]),
      note: z.string().optional(),
      absenceTime: z.string().optional(),
      absenceType: z.string().optional(),
    })
  ),
});

router.put("/:id/records", requireAuth, requireRole("admin", "teacher", "secretary"), teacherRBAC, async (req, res) => {
  const parsed = UpsertRecordsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const item = await Attendance.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });

  // RBAC for teacher
  if (req.user.role === "teacher") {
    if (!req.teacherAssignments.classes.includes(String(item.class))) {
      return res.status(403).json({ message: "Permission denied for this class" });
    }
  }

  // Replace records
  item.records = parsed.data.records.map((r) => ({
    student: r.studentId,
    status: r.status,
    note: r.note,
    absenceTime: r.absenceTime,
    absenceType: r.absenceType,
  }));
  await item.save();
  res.json({ item });
});

router.delete("/:id", requireAuth, requireRole("admin", "teacher"), teacherRBAC, async (req, res) => {
  const item = await Attendance.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });

  if (req.user.role === "teacher") {
     if (!req.teacherAssignments.classes.includes(String(item.class))) {
       return res.status(403).json({ message: "Permission denied" });
     }
  }

  await Attendance.deleteOne({ _id: item._id });
  res.json({ ok: true });
});

module.exports = router;

