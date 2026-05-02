const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const elearningController = require("../controllers/elearning.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});

const upload = multer({ storage });

router.use(requireAuth);

// Lessons
router.get("/lessons", elearningController.getLessons);
router.post("/lessons", requireRole("admin", "teacher"), upload.single("file"), elearningController.createLesson);

// Assignments
router.get("/assignments", elearningController.getAssignments);
router.post("/assignments", requireRole("admin", "teacher"), upload.single("file"), elearningController.createAssignment);

// Submissions
router.get("/submissions", elearningController.getSubmissions);
router.post("/submissions", requireRole("student"), upload.single("file"), elearningController.submitAssignment);
router.patch("/submissions/:id/grade", requireRole("admin", "teacher"), elearningController.gradeSubmission);

module.exports = router;
