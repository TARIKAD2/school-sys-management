const mongoose = require("mongoose");
const express = require("express");
const { z } = require("zod");
const { requireAuth, requireRole } = require("../middleware/auth");
const { Student } = require("../models/Student");
const { User } = require("../models/User");
const { parsePagination, parseSort, buildSearchFilter } = require("../utils/apiFeatures");
const { formatZodError } = require("../utils/validation");
const { teacherRBAC } = require("../middleware/rbac");

const router = express.Router();

const CreateStudentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  studentId: z.string().min(2),
  classId: z.string().optional(),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

router.get("/", requireAuth, requireRole("admin", "teacher", "secretary"), teacherRBAC, async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sortRaw = String(req.query.sort || "-createdAt");

  const filter = {};
  if (req.query.classId) {
    try {
      filter.class = new mongoose.Types.ObjectId(String(req.query.classId));
    } catch {
      filter.class = String(req.query.classId);
    }
  }

  if (req.user.role === "teacher") {
    filter.class = { $in: req.teacherAssignments.classes.map(c => new mongoose.Types.ObjectId(String(c))) };
  }

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
    { $unwind: "$user" },
    {
      $lookup: {
        from: "classes",
        localField: "class",
        foreignField: "_id",
        as: "class",
      },
    },
    { $unwind: { path: "$class", preserveNullAndEmptyArrays: true } }
  );

  if (q) {
    const rx = new RegExp(q, "i");
    pipeline.push({
      $match: {
        $or: [
          { studentId: rx },
          { phone: rx },
          { address: rx },
          { "user.name": rx },
          { "user.email": rx },
        ],
      },
    });
  }

  // Map allowed sort keys (client can send: name,email,studentId,createdAt)
  const sort = {};
  for (const part of sortRaw.split(",").map((s) => s.trim()).filter(Boolean)) {
    const desc = part.startsWith("-");
    const key = desc ? part.slice(1) : part;
    const dir = desc ? -1 : 1;
    if (key === "name") sort["user.name"] = dir;
    else if (key === "email") sort["user.email"] = dir;
    else if (key === "studentId") sort.studentId = dir;
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
        studentId: 1,
        dateOfBirth: 1,
        phone: 1,
        address: 1,
        createdAt: 1,
        updatedAt: 1,
        user: { _id: 1, name: 1, email: 1, role: 1, isActive: 1 },
        class: { _id: 1, name: 1, level: 1, academicYear: 1 },
      },
    },
  ];

  const [items, totalAgg] = await Promise.all([
    Student.aggregate(itemsPipeline),
    Student.aggregate(countPipeline),
  ]);
  const total = totalAgg[0]?.total || 0;

  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
});

router.get("/me", requireAuth, requireRole("student"), async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).populate("class").populate("user", "name email role isActive");
  if (!student) return res.status(404).json({ message: "Student profile not found" });
  res.json({ student });
});

router.get("/:id", requireAuth, requireRole("admin", "teacher", "secretary"), async (req, res) => {
  const student = await Student.findById(req.params.id).populate("user").populate("class");
  if (!student) return res.status(404).json({ message: "Not found" });
  res.json({ student });
});

router.post("/", requireAuth, requireRole("admin", "secretary"), async (req, res) => {
  const parsed = CreateStudentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: formatZodError(parsed.error) });

  const { name, email, password, studentId, classId, dateOfBirth, phone, address } = parsed.data;

  const emailLower = email.toLowerCase();
  const userExists = await User.findOne({ email: emailLower, role: "student" });
  if (userExists) return res.status(409).json({ message: "Student user already exists" });

  const studentIdExists = await Student.findOne({ studentId });
  if (studentIdExists) return res.status(409).json({ message: "Student ID already exists" });

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email: emailLower, passwordHash, role: "student" });

  const student = await Student.create({
    user: user._id,
    studentId,
    class: classId || undefined,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    phone,
    address,
  });

  res.status(201).json({ student: await Student.findById(student._id).populate("user").populate("class") });
});

const UpdateStudentSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  studentId: z.string().min(2).optional(),
  classId: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

router.put("/:id", requireAuth, requireRole("admin", "secretary"), async (req, res) => {
  const parsed = UpdateStudentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: formatZodError(parsed.error) });

  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: "Not found" });

  const updates = parsed.data;

  if (updates.studentId && updates.studentId !== student.studentId) {
    const exists = await Student.findOne({ studentId: updates.studentId });
    if (exists) return res.status(409).json({ message: "Student ID already exists" });
    student.studentId = updates.studentId;
  }

  if (updates.classId !== undefined) {
    student.class = updates.classId ? updates.classId : undefined;
  }
  if (updates.dateOfBirth !== undefined) {
    student.dateOfBirth = updates.dateOfBirth ? new Date(updates.dateOfBirth) : undefined;
  }
  if (updates.phone !== undefined) student.phone = updates.phone || undefined;
  if (updates.address !== undefined) student.address = updates.address || undefined;

  await student.save();

  if (updates.name || updates.email || updates.isActive !== undefined) {
    const user = await User.findById(student.user);
    if (user) {
      if (updates.name) user.name = updates.name;
      if (updates.email) user.email = updates.email.toLowerCase();
      if (updates.isActive !== undefined) user.isActive = updates.isActive;
      await user.save();
    }
  }

  res.json({ student: await Student.findById(student._id).populate("user").populate("class") });
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: "Not found" });

  await Promise.all([Student.deleteOne({ _id: student._id }), User.deleteOne({ _id: student.user })]);
  res.json({ ok: true });
});

module.exports = router;

