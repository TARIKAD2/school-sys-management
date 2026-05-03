const mongoose = require("mongoose");
const { User } = require("./src/models/User");
const { Teacher } = require("./src/models/Teacher");
const { ClassModel } = require("./src/models/Class");
const { ModuleModel } = require("./src/models/Module");
const { Student } = require("./src/models/Student");
const { Exam } = require("./src/models/Exam");
const { TimetableEntry } = require("./src/models/TimetableEntry");
const { Attendance } = require("./src/models/Attendance");
const { Grade } = require("./src/models/Grade");
const Invoice = require("./src/models/Invoice");
const { env } = require("./src/utils/env");

async function seed() {
  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to MongoDB.");

  console.log("Teacher model:", Teacher ? "Found" : "Missing");

  console.log("Clearing Teachers...");
  await Teacher.deleteMany({});
  console.log("Clearing Classes...");
  await ClassModel.deleteMany({});
  console.log("Clearing Modules...");
  await ModuleModel.deleteMany({});
  console.log("Clearing Students...");
  await Student.deleteMany({});
  console.log("Clearing Exams...");
  await Exam.deleteMany({});
  console.log("Clearing Timetable...");
  await TimetableEntry.deleteMany({});
  console.log("Clearing Attendance...");
  await Attendance.deleteMany({});
  console.log("Clearing Grades...");
  await Grade.deleteMany({});
  console.log("Clearing Invoices...");
  await Invoice.deleteMany({});
  console.log("Clearing non-admin Users...");
  await User.deleteMany({ role: { $ne: "admin" } });

  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    console.error("❌ Admin user not found. Please ensure SEED_ADMIN variables are set in .env.");
    process.exit(1);
  }

  const passwordHash = await User.hashPassword("password123");

  // Secretary
  await User.create({
    name: "System Secretary",
    email: "secretary@school.com",
    passwordHash,
    role: "secretary",
  });

  // Teachers
  const teacherDepts = ["Mathematics", "Science", "Literature", "History"];
  const teachers = [];
  for (let i = 1; i <= 4; i++) {
    const user = await User.create({ name: `Teacher ${i}`, email: `teacher${i}@school.com`, passwordHash, role: "teacher" });
    const t = await Teacher.create({ user: user._id, teacherId: `T100${i}`, department: teacherDepts[i - 1] });
    teachers.push(t);
  }

  // Classes
  const classes = [];
  const levels = ["10", "11", "12"];
  for (let i = 0; i < 3; i++) {
    const cls = await ClassModel.create({ name: `Grade ${levels[i]}A`, level: levels[i], academicYear: "2026/2027", homeroomTeacher: teachers[i]._id });
    classes.push(cls);
  }

  // Modules
  const moduleData = [
    { code: "MATH101", name: "Calculus I", credits: 5 },
    { code: "PHYS101", name: "General Physics", credits: 4 },
    { code: "LIT202", name: "Modern Literature", credits: 3 },
    { code: "HIST105", name: "World History", credits: 3 },
    { code: "COMP500", name: "Intro to JS", credits: 5 },
  ];
  const modules = [];
  for (const m of moduleData) {
    modules.push(await ModuleModel.create(m));
  }

  // Students
  const students = [];
  for (let i = 1; i <= 10; i++) {
    const user = await User.create({ name: `Student Name ${i}`, email: `student${i}@school.com`, passwordHash, role: "student" });
    const cls = classes[i % 3];
    const s = await Student.create({ user: user._id, studentId: `S2026-00${i}`, class: cls._id, discountType: i % 4 === 0 ? "percentage" : "none", discountValue: i % 4 === 0 ? 15 : 0 });
    students.push(s);
  }

  // Invoices (10)
  for (let i = 0; i < 10; i++) {
    const student = students[i];
    const amount = 1000 + (i * 50);
    const discountAmount = student.discountType === "percentage" ? (amount * student.discountValue) / 100 : 0;
    await Invoice.create({ student: student._id, title: "Semester Fees", amount, discountAmount, paidAmount: i % 2 === 0 ? (amount - discountAmount) : (i * 100), status: i % 2 === 0 ? "paid" : "partial", dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), createdBy: admin._id });
  }

  console.log("✅ Seeding Successful!");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seeding Failed:", err);
  process.exit(1);
});
