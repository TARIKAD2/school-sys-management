const Lesson = require("../models/Lesson");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Student = require("../models/Student").Student;

// Lessons
exports.getLessons = async (req, res) => {
  const { moduleId } = req.query;
  const query = moduleId ? { module: moduleId } : {};
  const lessons = await Lesson.find(query).populate("module").sort("-createdAt");
  res.json({ success: true, data: lessons });
};

exports.createLesson = async (req, res) => {
  const lesson = await Lesson.create({
    ...req.body,
    createdBy: req.user._id,
    fileUrl: req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl,
  });
  res.status(201).json({ success: true, data: lesson });
};

// Assignments
exports.getAssignments = async (req, res) => {
  const { moduleId } = req.query;
  const query = moduleId ? { module: moduleId } : {};
  const assignments = await Assignment.find(query).populate("module").sort("deadline");
  res.json({ success: true, data: assignments });
};

exports.createAssignment = async (req, res) => {
  const assignment = await Assignment.create({
    ...req.body,
    createdBy: req.user._id,
    fileUrl: req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl,
  });
  res.status(201).json({ success: true, data: assignment });
};

// Submissions
exports.submitAssignment = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ message: "Student profile not found" });

  const submission = await Submission.create({
    assignment: req.body.assignmentId,
    student: student._id,
    content: req.body.content,
    fileUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
  });

  res.status(201).json({ success: true, data: submission });
};

exports.getSubmissions = async (req, res) => {
  const { assignmentId } = req.query;
  const query = assignmentId ? { assignment: assignmentId } : {};
  
  if (req.user.role === "student") {
    const student = await Student.findOne({ user: req.user._id });
    query.student = student._id;
  }

  const submissions = await Submission.find(query)
    .populate("student")
    .populate({
      path: "assignment",
      populate: { path: "module" }
    })
    .sort("-submittedAt");

  res.json({ success: true, data: submissions });
};

exports.gradeSubmission = async (req, res) => {
  const { grade, feedback } = req.body;
  const submission = await Submission.findByIdAndUpdate(
    req.params.id,
    { grade, feedback, status: "graded" },
    { new: true }
  );
  res.json({ success: true, data: submission });
};
