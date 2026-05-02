const express = require("express");
const { z } = require("zod");
const { requireAuth, requireRole } = require("../middleware/auth");
const { ClassModel } = require("../models/Class");
const { parsePagination, parseSort, buildSearchFilter } = require("../utils/apiFeatures");
const { formatZodError } = require("../utils/validation");

const router = express.Router();

const CreateSchema = z.object({
  name: z.string().min(2),
  level: z.string().optional(),
  academicYear: z.string().optional(),
  homeroomTeacherId: z.string().optional(),
});

const { teacherRBAC } = require("../middleware/rbac");

router.get("/", requireAuth, requireRole("admin", "teacher", "student", "secretary"), teacherRBAC, async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query.sort);
  const filter = {};

  if (req.user.role === "teacher") {
    filter._id = { $in: req.teacherAssignments.classes };
  }

  const search = buildSearchFilter({ q: req.query.q, fields: ["name", "level", "academicYear"] });
  if (search) {
     if (filter._id) {
       filter.$and = [ { _id: filter._id }, search ];
       delete filter._id;
     } else {
       Object.assign(filter, search);
     }
  }

  const [items, total] = await Promise.all([
    ClassModel.find(filter)
      .populate({ path: "homeroomTeacher", populate: { path: "user", select: "name email" } })
      .sort(sort)
      .skip(skip)
      .limit(limit),
    ClassModel.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
});

router.get("/:id", requireAuth, requireRole("admin", "teacher", "student", "secretary"), async (req, res) => {
  const item = await ClassModel.findById(req.params.id).populate({
    path: "homeroomTeacher",
    populate: { path: "user", select: "name email" },
  });
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json({ item });
});

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: formatZodError(parsed.error) });
  const { name, level, academicYear, homeroomTeacherId } = parsed.data;
  const exists = await ClassModel.findOne({ name });
  if (exists) return res.status(409).json({ message: "Class already exists" });
  const item = await ClassModel.create({
    name,
    level,
    academicYear,
    homeroomTeacher: homeroomTeacherId || undefined,
  });
  res.status(201).json({ item });
});

const UpdateSchema = CreateSchema.partial();

router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = UpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: formatZodError(parsed.error) });
  const updates = parsed.data;
  if (updates.name) {
    const exists = await ClassModel.findOne({ name: updates.name, _id: { $ne: req.params.id } });
    if (exists) return res.status(409).json({ message: "Class name already exists" });
  }
  const updateDoc = { ...updates };
  if ("homeroomTeacherId" in updateDoc) {
    updateDoc.homeroomTeacher = updateDoc.homeroomTeacherId || undefined;
    delete updateDoc.homeroomTeacherId;
  }

  const item = await ClassModel.findByIdAndUpdate(req.params.id, updateDoc, { new: true });
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json({ item });
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const item = await ClassModel.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  await ClassModel.deleteOne({ _id: item._id });
  res.json({ ok: true });
});

module.exports = router;

