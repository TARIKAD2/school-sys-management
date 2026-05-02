const express = require("express");
const { z } = require("zod");
const { requireAuth, requireRole } = require("../middleware/auth");
const { User, ROLES } = require("../models/User");
const { parsePagination, parseSort, buildSearchFilter } = require("../utils/apiFeatures");

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  res.json({ user: req.user.toJSON() });
});

const UpdateMeSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
});

router.put("/me", requireAuth, async (req, res) => {
  const parsed = UpdateMeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const updates = parsed.data;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "Not found" });

  if (updates.email && updates.email.toLowerCase() !== user.email) {
    const exists = await User.findOne({ email: updates.email.toLowerCase(), _id: { $ne: user._id } });
    if (exists) return res.status(409).json({ message: "Email already in use" });
    user.email = updates.email.toLowerCase();
  }
  if (updates.name) user.name = updates.name;
  if (updates.password) user.passwordHash = await User.hashPassword(updates.password);

  await user.save();
  res.json({ user: user.toJSON() });
});

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(ROLES),
});

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const { name, email, password, role } = parsed.data;
  const exists = await User.findOne({ email: email.toLowerCase(), role });
  if (exists) return res.status(409).json({ message: "User already exists" });

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role });
  res.status(201).json({ user: user.toJSON() });
});

router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query.sort);
  const role = req.query.role ? String(req.query.role) : undefined;

  const filter = {};
  const search = buildSearchFilter({ q: req.query.q, fields: ["name", "email", "role"] });
  if (search) Object.assign(filter, search);
  if (role && ROLES.includes(role)) filter.role = role;

  const [items, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    items: items.map((u) => u.toJSON()),
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  });
});

module.exports = router;

