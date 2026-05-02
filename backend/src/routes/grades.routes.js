const express = require("express");
const { z } = require("zod");
const { requireAuth, requireRole } = require("../middleware/auth");
const { teacherRBAC } = require("../middleware/rbac");
const { Grade } = require("../models/Grade");
const { Student } = require("../models/Student");
const { Exam } = require("../models/Exam");
const { parsePagination, parseSort } = require("../utils/apiFeatures");

const router = express.Router();

router.get("/", requireAuth, requireRole("admin", "teacher", "student"), teacherRBAC, async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query.sort || "-createdAt");

  const filter = {};
  if (req.query.examId) filter.exam = String(req.query.examId);
  if (req.query.studentId) filter.student = String(req.query.studentId);

  if (req.user.role === "student") {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.json({ items: [], page, limit, total: 0, pages: 0 });
    filter.student = student._id;
  } else if (req.user.role === "teacher") {
    // Teachers see grades of students in their assigned classes
    const studentsInAssignedClasses = await Student.find({ class: { $in: req.teacherAssignments.classes } }).select("_id");
    const allowedStudentIds = studentsInAssignedClasses.map(s => s._id);
    filter.student = { $in: allowedStudentIds };

    if (req.query.studentId && !allowedStudentIds.some(id => String(id) === String(req.query.studentId))) {
      return res.status(403).json({ message: "Access denied to this student's grades" });
    }
  }

  const [items, total] = await Promise.all([
    Grade.find(filter)
      .populate({ path: "student", populate: [{ path: "user", select: "name email" }, { path: "class", select: "name" }] })
      .populate({ path: "exam", populate: [{ path: "module", select: "code name" }, { path: "class", select: "name" }] })
      .populate("createdBy", "name email role")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Grade.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
});

const CreateSchema = z.object({
  studentId: z.string().min(1),
  examId: z.string().min(1),
  score: z.number().min(0).max(100),
  comment: z.string().optional(),
});

router.post("/", requireAuth, requireRole("admin", "teacher"), teacherRBAC, async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  if (req.user.role === "teacher") {
    const student = await Student.findById(parsed.data.studentId);
    if (!student || !req.teacherAssignments.classes.includes(String(student.class))) {
      return res.status(403).json({ message: "You can only grade students in your assigned classes" });
    }
    const exam = await Exam.findById(parsed.data.examId);
    if (!exam || !req.teacherAssignments.classes.includes(String(exam.class))) {
      return res.status(403).json({ message: "You can only grade exams for your assigned classes" });
    }
  }

  try {
    const item = await Grade.create({
      student: parsed.data.studentId,
      exam: parsed.data.examId,
      score: parsed.data.score,
      comment: parsed.data.comment,
      createdBy: req.user._id,
    });
    res.status(201).json({ item });
  } catch (e) {
    return res.status(409).json({ message: "Grade already exists for this student & exam" });
  }
});

const UpdateSchema = z.object({
  score: z.number().min(0).max(100).optional(),
  comment: z.string().nullable().optional(),
});

router.put("/:id", requireAuth, requireRole("admin", "teacher"), teacherRBAC, async (req, res) => {
  const parsed = UpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const grade = await Grade.findById(req.params.id).populate("student");
  if (!grade) return res.status(404).json({ message: "Not found" });

  if (req.user.role === "teacher") {
    if (!req.teacherAssignments.classes.includes(String(grade.student.class))) {
      return res.status(403).json({ message: "Permission denied for this grade" });
    }
  }

  const updates = parsed.data;
  const updateDoc = { ...updates };
  if ("comment" in updateDoc) updateDoc.comment = updateDoc.comment || undefined;

  const item = await Grade.findByIdAndUpdate(req.params.id, updateDoc, { new: true });
  res.json({ item });
});

router.delete("/:id", requireAuth, requireRole("admin", "teacher"), teacherRBAC, async (req, res) => {
  const grade = await Grade.findById(req.params.id).populate("student");
  if (!grade) return res.status(404).json({ message: "Not found" });

  if (req.user.role === "teacher") {
    if (!req.teacherAssignments.classes.includes(String(grade.student.class))) {
      return res.status(403).json({ message: "Permission denied" });
    }
  }

  await Grade.deleteOne({ _id: grade._id });
  res.json({ ok: true });
});

module.exports = router;

