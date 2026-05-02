const express = require("express");
const { z } = require("zod");
const { requireAuth, requireRole } = require("../middleware/auth");
const { TimetableEntry } = require("../models/TimetableEntry");
const { Student } = require("../models/Student");
const { Teacher } = require("../models/Teacher");
const { parsePagination, parseSort } = require("../utils/apiFeatures");

const router = express.Router();

router.get("/", requireAuth, requireRole("admin", "teacher", "student"), async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query.sort || "dayOfWeek,startTime");

  const filter = {};
  if (req.query.classId) filter.class = String(req.query.classId);
  if (req.query.teacherId) filter.teacher = String(req.query.teacherId);
  if (req.query.dayOfWeek !== undefined) filter.dayOfWeek = Number(req.query.dayOfWeek);

  if (req.user.role === "student") {
    const student = await Student.findOne({ user: req.user._id });
    if (!student?.class) return res.json({ items: [], page, limit, total: 0, pages: 0 });
    filter.class = student.class;
  }

  if (req.user.role === "teacher") {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (teacher?._id) filter.teacher = teacher._id;
  }

  const [items, total] = await Promise.all([
    TimetableEntry.find(filter)
      .populate("class", "name level academicYear")
      .populate("module", "code name")
      .populate({ path: "teacher", populate: { path: "user", select: "name email" } })
      .sort(sort)
      .skip(skip)
      .limit(limit),
    TimetableEntry.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
});

const CreateSchema = z.object({
  classId: z.string().min(1),
  moduleId: z.string().min(1),
  teacherId: z.string().optional(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
  room: z.string().optional(),
});

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
  try {
    const item = await TimetableEntry.create({
      class: parsed.data.classId,
      module: parsed.data.moduleId,
      teacher: parsed.data.teacherId || undefined,
      dayOfWeek: parsed.data.dayOfWeek,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      room: parsed.data.room,
    });
    res.status(201).json({ item });
  } catch (e) {
    res.status(409).json({ message: "Timetable entry already exists for this slot" });
  }
});

const UpdateSchema = CreateSchema.partial();

router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = UpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
  const updateDoc = { ...parsed.data };
  if ("classId" in updateDoc) {
    updateDoc.class = updateDoc.classId;
    delete updateDoc.classId;
  }
  if ("moduleId" in updateDoc) {
    updateDoc.module = updateDoc.moduleId;
    delete updateDoc.moduleId;
  }
  if ("teacherId" in updateDoc) {
    updateDoc.teacher = updateDoc.teacherId || undefined;
    delete updateDoc.teacherId;
  }
  const item = await TimetableEntry.findByIdAndUpdate(req.params.id, updateDoc, { new: true });
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json({ item });
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const item = await TimetableEntry.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  await TimetableEntry.deleteOne({ _id: item._id });
  res.json({ ok: true });
});

module.exports = router;

