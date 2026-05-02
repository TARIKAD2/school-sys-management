const express = require("express");
const { z } = require("zod");
const { requireAuth, requireRole } = require("../middleware/auth");
const { Teacher } = require("../models/Teacher");
const { User } = require("../models/User");
const { parsePagination, parseSort, buildSearchFilter } = require("../utils/apiFeatures");
const { formatZodError } = require("../utils/validation");

const router = express.Router();

const CreateTeacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  teacherId: z.string().min(2),
  department: z.string().optional(),
  phone: z.string().optional(),
  assignedClasses: z.array(z.string()).optional(),
  assignedModules: z.array(z.string()).optional(),
});

router.get("/", requireAuth, requireRole("admin", "secretary"), async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sortRaw = String(req.query.sort || "-createdAt");

  const filter = {};
  if (req.query.department) filter.department = new RegExp(String(req.query.department).trim(), "i");
  const q = req.query.q ? String(req.query.q).trim() : "";

  const pipeline = [{ $match: filter }];
  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" }
  );

  if (q) {
    const rx = new RegExp(q, "i");
    pipeline.push({
      $match: {
        $or: [{ teacherId: rx }, { department: rx }, { phone: rx }, { "user.name": rx }, { "user.email": rx }],
      },
    });
  }

  const sort = {};
  for (const part of sortRaw.split(",").map((s) => s.trim()).filter(Boolean)) {
    const desc = part.startsWith("-");
    const key = desc ? part.slice(1) : part;
    const dir = desc ? -1 : 1;
    if (key === "name") sort["user.name"] = dir;
    else if (key === "email") sort["user.email"] = dir;
    else if (key === "teacherId") sort.teacherId = dir;
    else if (key === "createdAt") sort.createdAt = dir;
  }
  if (!Object.keys(sort).length) sort.createdAt = -1;

  const countPipeline = [...pipeline, { $count: "total" }];
  const itemsPipeline = [
    ...pipeline,
    { $sort: sort },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        teacherId: 1,
        department: 1,
        phone: 1,
        createdAt: 1,
        updatedAt: 1,
        user: { _id: 1, name: 1, email: 1, role: 1, isActive: 1 },
      },
    },
  ];

  const [items, totalAgg] = await Promise.all([Teacher.aggregate(itemsPipeline), Teacher.aggregate(countPipeline)]);
  const total = totalAgg[0]?.total || 0;
  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
});

router.get("/me", requireAuth, requireRole("teacher"), async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });
  if (!teacher) return res.status(404).json({ message: "Teacher profile not found" });
  res.json({ teacher });
});

router.get("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).populate("user");
  if (!teacher) return res.status(404).json({ message: "Not found" });
  res.json({ teacher });
});

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = CreateTeacherSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: formatZodError(parsed.error) });

  const { name, email, password, teacherId, department, phone } = parsed.data;

  const emailLower = email.toLowerCase();
  const userExists = await User.findOne({ email: emailLower, role: "teacher" });
  if (userExists) return res.status(409).json({ message: "Teacher user already exists" });

  const teacherIdExists = await Teacher.findOne({ teacherId });
  if (teacherIdExists) return res.status(409).json({ message: "Teacher ID already exists" });

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email: emailLower, passwordHash, role: "teacher" });

  const teacherData = { user: user._id, teacherId, department, phone };
  if (parsed.data.assignedClasses) teacherData.assignedClasses = parsed.data.assignedClasses;
  if (parsed.data.assignedModules) teacherData.assignedModules = parsed.data.assignedModules;

  const teacher = await Teacher.create(teacherData);
  res.status(201).json({ teacher: await Teacher.findById(teacher._id).populate("user").populate("assignedClasses").populate("assignedModules") });
});

const UpdateTeacherSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  teacherId: z.string().min(2).optional(),
  department: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  assignedClasses: z.array(z.string()).optional(),
  assignedModules: z.array(z.string()).optional(),
});

router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = UpdateTeacherSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: formatZodError(parsed.error) });

  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ message: "Not found" });
  const updates = parsed.data;

  if (updates.teacherId && updates.teacherId !== teacher.teacherId) {
    const exists = await Teacher.findOne({ teacherId: updates.teacherId });
    if (exists) return res.status(409).json({ message: "Teacher ID already exists" });
    teacher.teacherId = updates.teacherId;
  }
  if (updates.department !== undefined) teacher.department = updates.department || undefined;
  if (updates.phone !== undefined) teacher.phone = updates.phone || undefined;
  if (updates.assignedClasses !== undefined) teacher.assignedClasses = updates.assignedClasses;
  if (updates.assignedModules !== undefined) teacher.assignedModules = updates.assignedModules;
  await teacher.save();

  if (updates.name || updates.email || updates.isActive !== undefined) {
    const user = await User.findById(teacher.user);
    if (user) {
      if (updates.name) user.name = updates.name;
      if (updates.email) user.email = updates.email.toLowerCase();
      if (updates.isActive !== undefined) user.isActive = updates.isActive;
      await user.save();
    }
  }

  res.json({ teacher: await Teacher.findById(teacher._id).populate("user").populate("assignedClasses").populate("assignedModules") });
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ message: "Not found" });
  await Promise.all([Teacher.deleteOne({ _id: teacher._id }), User.deleteOne({ _id: teacher.user })]);
  res.json({ ok: true });
});

module.exports = router;

