const express = require("express");
const { z } = require("zod");
const { requireAuth, requireRole } = require("../middleware/auth");
const { ModuleModel } = require("../models/Module");
const { parsePagination, parseSort, buildSearchFilter } = require("../utils/apiFeatures");

const router = express.Router();

const CreateSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  classId: z.string().optional(),
  teacherId: z.string().optional(),
});

const { teacherRBAC } = require("../middleware/rbac");

router.get("/", requireAuth, requireRole("admin", "teacher", "student", "secretary"), teacherRBAC, async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query.sort);
  const filter = {};
  if (req.query.classId) filter.class = String(req.query.classId);
  
  if (req.user.role === "teacher") {
     filter._id = { $in: req.teacherAssignments.modules };
  }

  const search = buildSearchFilter({ q: req.query.q, fields: ["code", "name"] });
  if (search) {
     if (filter._id) {
       filter.$and = [ { _id: filter._id }, search ];
       delete filter._id;
     } else {
       Object.assign(filter, search);
     }
  }

  const [items, total] = await Promise.all([
    ModuleModel.find(filter)
      .populate("class", "name level academicYear")
      .populate({ path: "teacher", populate: { path: "user", select: "name email" } })
      .sort(sort)
      .skip(skip)
      .limit(limit),
    ModuleModel.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
});

router.get("/:id", requireAuth, requireRole("admin", "teacher", "student", "secretary"), async (req, res) => {
  const item = await ModuleModel.findById(req.params.id)
    .populate("class", "name level academicYear")
    .populate({ path: "teacher", populate: { path: "user", select: "name email" } });
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json({ item });
});

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
  const { code, name, classId, teacherId } = parsed.data;
  const exists = await ModuleModel.findOne({ code });
  if (exists) return res.status(409).json({ message: "Module code already exists" });
  const item = await ModuleModel.create({
    code,
    name,
    class: classId || undefined,
    teacher: teacherId || undefined,
  });
  res.status(201).json({ item });
});

const UpdateSchema = CreateSchema.partial();

router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = UpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
  const updates = parsed.data;
  if (updates.code) {
    const exists = await ModuleModel.findOne({ code: updates.code, _id: { $ne: req.params.id } });
    if (exists) return res.status(409).json({ message: "Module code already exists" });
  }
  const updateDoc = { ...updates };
  if ("classId" in updateDoc) {
    updateDoc.class = updateDoc.classId || undefined;
    delete updateDoc.classId;
  }
  if ("teacherId" in updateDoc) {
    updateDoc.teacher = updateDoc.teacherId || undefined;
    delete updateDoc.teacherId;
  }
  const item = await ModuleModel.findByIdAndUpdate(req.params.id, updateDoc, { new: true });
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json({ item });
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const item = await ModuleModel.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  await ModuleModel.deleteOne({ _id: item._id });
  res.json({ ok: true });
});

module.exports = router;

