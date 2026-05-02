const express = require("express");
const { z } = require("zod");
const { requireAuth, requireRole } = require("../middleware/auth");
const { Demand } = require("../models/Demand");
const { Student } = require("../models/Student");
const { Teacher } = require("../models/Teacher");
const { parsePagination, parseSort } = require("../utils/apiFeatures");

const router = express.Router();

const CreateDemandSchema = z.object({
  studentId: z.string().optional(),
  teacherId: z.string().optional(),
  message: z.string().optional(),
  recipientType: z.enum(["student", "teacher"]).optional(),
});

const { sendNotification } = require("../controllers/notifications.controller");

// Create a demand (Secretary only)
router.post("/", requireAuth, requireRole("secretary"), async (req, res) => {
  const parsed = CreateDemandSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  const { studentId, teacherId, message, recipientType } = parsed.data;

  const type = recipientType || (teacherId ? "teacher" : "student");
  if (type === "student" && !studentId) return res.status(400).json({ message: "studentId required" });
  if (type === "teacher" && !teacherId) return res.status(400).json({ message: "teacherId required" });

  const demandData = {
    secretary: req.user._id,
    message: message || undefined,
    recipientType: type,
    readBy: [],
  };
  if (type === "student") demandData.student = studentId;
  if (type === "teacher") demandData.teacher = teacherId;

  const demand = await Demand.create(demandData);

  // Trigger real-time notifications
  let targetUserId = null;
  if (type === "student") {
    const studentUser = await Student.findById(studentId).populate("user");
    if (studentUser && studentUser.user) targetUserId = studentUser.user._id;
  } else if (type === "teacher") {
    const teacherUser = await Teacher.findById(teacherId).populate("user");
    if (teacherUser && teacherUser.user) targetUserId = teacherUser.user._id;
  }

  if (targetUserId) {
    // 1. Create native notification -> this naturally triggers `io.emit("notification")` in the controller
    await sendNotification(req.app, targetUserId, {
      title: "New Administrative Message",
      message: demand.message || "You have a new message from the secretary.",
      type: "message",
      link: type === "student" ? "/student/messages" : "/teacher/messages"
    });

    // 2. Emit specific WebSocket payload for live-updating the messages inbox table
    const io = req.app.get("io");
    if (io) {
      // Need to populate secretary to match GET /demands formatting
      const populatedDemand = await Demand.findById(demand._id).populate("secretary", "name email");
      io.to(targetUserId.toString()).emit("new_message", populatedDemand);
    }
  }

  res.status(201).json({ item: demand });
});

// List demands (Admin, Secretary can see all, Student/Teacher sees their own)
router.get("/", requireAuth, async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const sort = parseSort(req.query.sort || "-createdAt");

  const filter = {};

  if (req.user.role === "student") {
    const studentDoc = await Student.findOne({ user: req.user._id });
    if (!studentDoc) return res.json({ items: [], total: 0, page, limit, pages: 0 });
    filter.student = studentDoc._id;
    filter.recipientType = "student";
  } else if (req.user.role === "teacher") {
    const teacherDoc = await Teacher.findOne({ user: req.user._id });
    if (!teacherDoc) return res.json({ items: [], total: 0, page, limit, pages: 0 });
    filter.teacher = teacherDoc._id;
    filter.recipientType = "teacher";
  }

  if (req.query.studentId) filter.student = String(req.query.studentId);
  if (req.query.recipientType) filter.recipientType = String(req.query.recipientType);

  const [items, total] = await Promise.all([
    Demand.find(filter)
      .populate({
        path: "student",
        populate: { path: "user", select: "name email" },
      })
      .populate({
        path: "teacher",
        populate: { path: "user", select: "name email" },
      })
      .populate("secretary", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Demand.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
});

// Get unread count for current user (notification badge)
router.get("/unread-count", requireAuth, async (req, res) => {
  const filter = { readBy: { $ne: req.user._id } };

  if (req.user.role === "student") {
    const studentDoc = await Student.findOne({ user: req.user._id });
    if (!studentDoc) return res.json({ count: 0 });
    filter.student = studentDoc._id;
    filter.recipientType = "student";
  } else if (req.user.role === "teacher") {
    const teacherDoc = await Teacher.findOne({ user: req.user._id });
    if (!teacherDoc) return res.json({ count: 0 });
    filter.teacher = teacherDoc._id;
    filter.recipientType = "teacher";
  } else {
    // Admin/Secretary: count their unread as demands they haven't seen
    return res.json({ count: 0 });
  }

  const count = await Demand.countDocuments(filter);
  res.json({ count });
});

// Mark a demand as read by current user
router.patch("/:id/read", requireAuth, async (req, res) => {
  const demand = await Demand.findById(req.params.id);
  if (!demand) return res.status(404).json({ message: "Not found" });

  const uid = req.user._id.toString();
  const alreadyRead = demand.readBy.some((r) => r.toString() === uid);
  
  if (!alreadyRead) {
    demand.readBy.push(req.user._id);
    demand.status = "read";
    await demand.save();

    // Sync state with global notifications collection
    const Notification = require("../models/Notification");
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false, type: "message" }, 
      { isRead: true }
    );

    // Fire event to tell client components to clear notification badges
    const io = req.app.get("io");
    if (io) {
      io.to(uid).emit("sync_notifications");
      
      // Tell the sender (secretary) that their message was read natively 
      if (demand.secretary) {
        io.to(demand.secretary.toString()).emit("demand_read", demand._id);
      }
    }
  }
  
  res.json({ item: demand });
});

// Update status
router.patch("/:id", requireAuth, requireRole("admin", "secretary"), async (req, res) => {
  const demand = await Demand.findById(req.params.id);
  if (!demand) return res.status(404).json({ message: "Not found" });

  if (req.body.status) demand.status = req.body.status;
  await demand.save();
  res.json({ item: demand });
});

module.exports = router;
