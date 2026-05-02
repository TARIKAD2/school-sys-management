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
const { env } = require("./src/utils/env");

async function seed() {
  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // Delete all data except Admin
  await Teacher.deleteMany({});
  await ClassModel.deleteMany({});
  await ModuleModel.deleteMany({});
  await Student.deleteMany({});
  await Exam.deleteMany({});
  await TimetableEntry.deleteMany({});
  await Attendance.deleteMany({});
  await Grade.deleteMany({});
  
  await User.deleteMany({ role: { $ne: "admin" } });
  const admin = await User.findOne({ role: "admin" });

  console.log("Deleted old data. Starting seed...");

  const passwordHash = await User.hashPassword("password123");

  // Create Users (Teachers)
  const teacherUser1 = await User.create({ name: "Alice Teacher", email: "alice@school.com", passwordHash, role: "teacher" });
  const teacherUser2 = await User.create({ name: "Bob Math Teacher", email: "bob@school.com", passwordHash, role: "teacher" });

  // Create Teachers
  const teacher1 = await Teacher.create({ user: teacherUser1._id, teacherId: "T001", department: "Science" });
  const teacher2 = await Teacher.create({ user: teacherUser2._id, teacherId: "T002", department: "Math" });

  // Create Classes
  const classA = await ClassModel.create({ name: "Grade 10A", level: "10", academicYear: "2026/2027", homeroomTeacher: teacher1._id });
  const classB = await ClassModel.create({ name: "Grade 11B", level: "11", academicYear: "2026/2027", homeroomTeacher: teacher2._id });

  // Create Modules
  const modPhysics = await ModuleModel.create({ code: "PHY101", name: "Physics Basics", credits: 4 });
  const modMath = await ModuleModel.create({ code: "MAT201", name: "Advanced Math", credits: 5 });

  // Create Users (Students)
  const studentUser1 = await User.create({ name: "Charlie Student", email: "charlie@school.com", passwordHash, role: "student" });
  const studentUser2 = await User.create({ name: "Diana Student", email: "diana@school.com", passwordHash, role: "student" });
  const studentUser3 = await User.create({ name: "Evan Student", email: "evan@school.com", passwordHash, role: "student" });
  
  // Create Students
  const student1 = await Student.create({ user: studentUser1._id, studentId: "S001", class: classA._id });
  const student2 = await Student.create({ user: studentUser2._id, studentId: "S002", class: classA._id });
  const student3 = await Student.create({ user: studentUser3._id, studentId: "S003", class: classB._id });

  // Create Timetable
  await TimetableEntry.create({ class: classA._id, module: modPhysics._id, teacher: teacher1._id, dayOfWeek: 1, startTime: "08:00", endTime: "10:00", room: "Room 101" });
  await TimetableEntry.create({ class: classA._id, module: modMath._id, teacher: teacher2._id, dayOfWeek: 2, startTime: "10:00", endTime: "12:00", room: "Room 102" });
  
  // Create Exams
  const exam1 = await Exam.create({ title: "Midterm Physics", date: new Date(), duration: 60, maxScore: 100, class: classA._id, module: modPhysics._id, teacher: teacher1._id, createdBy: admin._id });

  // Create Attendance
  await Attendance.create({
    date: new Date(),
    class: classA._id,
    module: modPhysics._id,
    teacher: teacher1._id,
    createdBy: admin._id,
    records: [
      { student: student1._id, status: "present", note: "" },
      { student: student2._id, status: "absent", note: "Sick" },
    ]
  });

  // Create Grades
  await Grade.create({ exam: exam1._id, student: student1._id, class: classA._id, module: modPhysics._id, score: 95, createdBy: admin._id });
  await Grade.create({ exam: exam1._id, student: student2._id, class: classA._id, module: modPhysics._id, score: 88, createdBy: admin._id });

  console.log("Seeding complete!");
  console.log("Teacher 1: alice@school.com / password123");
  console.log("Target Student: diana@school.com (Student 2) / password123. Got an absence on Physics Basics.");
  
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
