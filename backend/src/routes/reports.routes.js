const express = require("express");
const { z } = require("zod");
const { requireAuth, requireRole } = require("../middleware/auth");
const { Report } = require("../models/Report");
const { parsePagination, parseSort, buildSearchFilter } = require("../utils/apiFeatures");

const router = express.Router();

router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query.sort || "-createdAt");
  const filter = {};
  const search = buildSearchFilter({ q: req.query.q, fields: ["title", "type", "summary"] });
  if (search) Object.assign(filter, search);
  if (req.query.type) filter.type = String(req.query.type);

  const [items, total] = await Promise.all([
    Report.find(filter).populate("createdBy", "name email role").sort(sort).skip(skip).limit(limit),
    Report.countDocuments(filter),
  ]);
  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
});

const CreateSchema = z.object({
  title: z.string().min(2),
  type: z.enum(["attendance", "grades", "general"]).optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  summary: z.string().optional(),
});

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
  const item = await Report.create({
    title: parsed.data.title,
    type: parsed.data.type || "general",
    periodStart: parsed.data.periodStart ? new Date(parsed.data.periodStart) : undefined,
    periodEnd: parsed.data.periodEnd ? new Date(parsed.data.periodEnd) : undefined,
    summary: parsed.data.summary,
    createdBy: req.user._id,
  });
  res.status(201).json({ item });
});

const UpdateSchema = CreateSchema.partial();

router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = UpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
  const updateDoc = { ...parsed.data };
  if ("periodStart" in updateDoc) updateDoc.periodStart = updateDoc.periodStart ? new Date(updateDoc.periodStart) : undefined;
  if ("periodEnd" in updateDoc) updateDoc.periodEnd = updateDoc.periodEnd ? new Date(updateDoc.periodEnd) : undefined;

  const item = await Report.findByIdAndUpdate(req.params.id, updateDoc, { new: true });
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json({ item });
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const item = await Report.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  await Report.deleteOne({ _id: item._id });
  res.json({ ok: true });
});

module.exports = router;

