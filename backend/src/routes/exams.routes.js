const express = require("express");
const { z } = require("zod");
const { requireAuth, requireRole } = require("../middleware/auth");
const { Exam } = require("../models/Exam");
const { Student } = require("../models/Student");
const { parsePagination, parseSort, buildSearchFilter } = require("../utils/apiFeatures");
const { formatZodError } = require("../utils/validation");

const router = express.Router();

const CreateSchema = z.object({
  title: z.string().min(2),
  moduleId: z.string().min(1),
  classId: z.string().min(1),
  date: z.string().min(1),
});

router.get("/", requireAuth, requireRole("admin", "teacher", "student", "secretary"), async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query.sort);

  const filter = {};
  const search = buildSearchFilter({ q: req.query.q, fields: ["title"] });
  if (search) Object.assign(filter, search);

  if (req.user.role === "student") {
    const student = await Student.findOne({ user: req.user._id });
    if (student?.class) filter.class = student.class;
    else filter.class = null; // no results
  }

  if (req.query.classId) filter.class = String(req.query.classId);
  if (req.query.moduleId) filter.module = String(req.query.moduleId);

  const [items, total] = await Promise.all([
    Exam.find(filter)
      .populate("module", "code name")
      .populate("class", "name level academicYear")
      .populate("createdBy", "name email role")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Exam.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
});

router.get("/:id", requireAuth, requireRole("admin", "teacher", "student", "secretary"), async (req, res) => {
  const item = await Exam.findById(req.params.id)
    .populate("module", "code name")
    .populate("class", "name level academicYear")
    .populate("createdBy", "name email role");
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json({ item });
});

router.post("/", requireAuth, requireRole("admin", "teacher", "secretary"), async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: formatZodError(parsed.error) });
  const { title, moduleId, classId, date } = parsed.data;

  const item = await Exam.create({
    title,
    module: moduleId,
    class: classId,
    date: new Date(date),
    createdBy: req.user._id,
  });
  res.status(201).json({ item });
});

const UpdateSchema = CreateSchema.partial();

router.put("/:id", requireAuth, requireRole("admin", "teacher", "secretary"), async (req, res) => {
  const parsed = UpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: formatZodError(parsed.error) });
  const updates = parsed.data;
  const updateDoc = { ...updates };
  if ("moduleId" in updateDoc) {
    updateDoc.module = updateDoc.moduleId;
    delete updateDoc.moduleId;
  }
  if ("classId" in updateDoc) {
    updateDoc.class = updateDoc.classId;
    delete updateDoc.classId;
  }
  if ("date" in updateDoc) updateDoc.date = updateDoc.date ? new Date(updateDoc.date) : undefined;

  const item = await Exam.findByIdAndUpdate(req.params.id, updateDoc, { new: true });
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json({ item });
});

router.delete("/:id", requireAuth, requireRole("admin", "teacher"), async (req, res) => {
  const item = await Exam.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  await Exam.deleteOne({ _id: item._id });
  res.json({ ok: true });
});

module.exports = router;

