const mongoose = require("mongoose");
const { User } = require("./src/models/User");
const { Teacher } = require("./src/models/Teacher");
const { ClassModel } = require("./src/models/Class");
const { ModuleModel } = require("./src/models/Module");
const { Student } = require("./src/models/Student");
const { Exam } = require("./src/models/Exam");
const { TimetableEntry } = require("./src/models/TimetableEntry");
const { Attendance } = require("./src/models/Attendance");
const { Report } = require("./src/models/Report");
const { Demand } = require("./src/models/Demand");
const { env } = require("./src/utils/env");

const data = {
  "users": [
    { "_id": "u1", "name": "Admin User", "email": "admin@school.com", "role": "admin", "isActive": true },
    { "_id": "u2", "name": "Ahmed Benali", "email": "ahmed@school.com", "role": "teacher", "isActive": true },
    { "_id": "u3", "name": "Sara Nouri", "email": "sara@school.com", "role": "teacher", "isActive": true },
    { "_id": "u4", "name": "Youssef Karim", "email": "youssef@school.com", "role": "teacher", "isActive": true },
    { "_id": "u5", "name": "Ali Hassan", "email": "ali@student.com", "role": "student", "isActive": true },
    { "_id": "u6", "name": "Meryem Tazi", "email": "meryem@student.com", "role": "student", "isActive": true },
    { "_id": "u7", "name": "Omar Idrissi", "email": "omar@student.com", "role": "student", "isActive": true },
    { "_id": "u8", "name": "Salma Fassi", "email": "salma@student.com", "role": "student", "isActive": true },
    { "_id": "u9", "name": "Hind Alaoui", "email": "hind@student.com", "role": "student", "isActive": true },
    { "_id": "u10", "name": "Zakaria Amrani", "email": "zakaria@student.com", "role": "student", "isActive": true },
    { "_id": "u11", "name": "Imane Chraibi", "email": "imane@student.com", "role": "student", "isActive": true },
    { "_id": "u12", "name": "Nabil Jaziri", "email": "nabil@student.com", "role": "student", "isActive": true },
    { "_id": "u13", "name": "Rania Bennis", "email": "rania@student.com", "role": "student", "isActive": true },
    { "_id": "u14", "name": "Hamza Saidi", "email": "hamza@student.com", "role": "student", "isActive": true },
    { "_id": "u15", "name": "Lina Mouline", "email": "lina@student.com", "role": "student", "isActive": true },
    { "_id": "u16", "name": "Malak Secretary", "email": "secretary@school.com", "role": "secretary", "isActive": true }
  ],

  "teachers": [
    { "_id": "t1", "user": "u2", "teacherId": "T001", "department": "Mathematics" },
    { "_id": "t2", "user": "u3", "teacherId": "T002", "department": "Physics" },
    { "_id": "t3", "user": "u4", "teacherId": "T003", "department": "English" }
  ],

  "classes": [
    { "_id": "c1", "name": "1BAC-A", "level": "1 BAC", "academicYear": "2025/2026", "homeroomTeacher": "t1" },
    { "_id": "c2", "name": "2BAC-SM", "level": "2 BAC", "academicYear": "2025/2026", "homeroomTeacher": "t2" },
    { "_id": "c3", "name": "TC-B", "level": "Tronc Commun", "academicYear": "2025/2026", "homeroomTeacher": "t3" }
  ],

  "students": [
    { "_id": "s1", "user": "u5", "studentId": "ST001", "class": "c1", "dateOfBirth": "2008-01-15" },
    { "_id": "s2", "user": "u6", "studentId": "ST002", "class": "c1", "dateOfBirth": "2008-03-20" },
    { "_id": "s3", "user": "u7", "studentId": "ST003", "class": "c1", "dateOfBirth": "2008-05-10" },
    { "_id": "s4", "user": "u8", "studentId": "ST004", "class": "c1", "dateOfBirth": "2008-07-18" },
    { "_id": "s5", "user": "u9", "studentId": "ST005", "class": "c1", "dateOfBirth": "2008-08-01" },

    { "_id": "s6", "user": "u10", "studentId": "ST006", "class": "c2", "dateOfBirth": "2007-02-11" },
    { "_id": "s7", "user": "u11", "studentId": "ST007", "class": "c2", "dateOfBirth": "2007-04-09" },
    { "_id": "s8", "user": "u12", "studentId": "ST008", "class": "c2", "dateOfBirth": "2007-06-30" },
    { "_id": "s9", "user": "u13", "studentId": "ST009", "class": "c2", "dateOfBirth": "2007-09-21" },
    { "_id": "s10", "user": "u14", "studentId": "ST010", "class": "c2", "dateOfBirth": "2007-10-05" },

    { "_id": "s11", "user": "u15", "studentId": "ST011", "class": "c3", "dateOfBirth": "2009-01-12" }
  ],

  "modules": [
    { "_id": "m1", "code": "MAT101", "name": "Mathematics", "class": "c1", "teacher": "t1" },
    { "_id": "m2", "code": "PHY101", "name": "Physics", "class": "c1", "teacher": "t2" },
    { "_id": "m3", "code": "ENG101", "name": "English", "class": "c1", "teacher": "t3" },

    { "_id": "m4", "code": "MAT201", "name": "Advanced Math", "class": "c2", "teacher": "t1" },
    { "_id": "m5", "code": "PHY201", "name": "Mechanics", "class": "c2", "teacher": "t2" },
    { "_id": "m6", "code": "ENG201", "name": "Communication", "class": "c2", "teacher": "t3" },

    { "_id": "m7", "code": "ENG001", "name": "Basic English", "class": "c3", "teacher": "t3" }
  ],

  "exams": [
    { "_id": "e1", "title": "Math Test 1", "module": "m1", "class": "c1", "date": "2026-01-15", "createdBy": "u1" },
    { "_id": "e2", "title": "Physics Quiz", "module": "m2", "class": "c1", "date": "2026-01-20", "createdBy": "u1" },
    { "_id": "e3", "title": "English Oral", "module": "m3", "class": "c1", "date": "2026-01-25", "createdBy": "u1" },
    { "_id": "e4", "title": "Advanced Math Final", "module": "m4", "class": "c2", "date": "2026-02-01", "createdBy": "u1" },
    { "_id": "e5", "title": "Mechanics Exam", "module": "m5", "class": "c2", "date": "2026-02-05", "createdBy": "u1" }
  ],

  "timetable": [
    { "_id": "tt1", "class": "c1", "module": "m1", "teacher": "t1", "dayOfWeek": 1, "startTime": "08:00", "endTime": "10:00" },
    { "_id": "tt2", "class": "c1", "module": "m2", "teacher": "t2", "dayOfWeek": 2, "startTime": "10:00", "endTime": "12:00" },
    { "_id": "tt3", "class": "c1", "module": "m3", "teacher": "t3", "dayOfWeek": 3, "startTime": "09:00", "endTime": "11:00" },

    { "_id": "tt4", "class": "c2", "module": "m4", "teacher": "t1", "dayOfWeek": 1, "startTime": "08:00", "endTime": "10:00" },
    { "_id": "tt5", "class": "c2", "module": "m5", "teacher": "t2", "dayOfWeek": 4, "startTime": "10:00", "endTime": "12:00" },

    { "_id": "tt6", "class": "c3", "module": "m7", "teacher": "t3", "dayOfWeek": 5, "startTime": "09:00", "endTime": "11:00" }
  ],

  "attendance": [
    {
      "_id": "a1",
      "date": "2026-04-20",
      "class": "c1",
      "module": "m1",
      "teacher": "t1",
      "createdBy": "u2",
      "records": [
        { "student": "s1", "status": "Present" },
        { "student": "s2", "status": "Absent" },
        { "student": "s3", "status": "Present" }
      ]
    },
    {
      "_id": "a2",
      "date": "2026-04-21",
      "class": "c2",
      "module": "m4",
      "teacher": "t1",
      "createdBy": "u2",
      "records": [
        { "student": "s6", "status": "Present" },
        { "student": "s7", "status": "Late" }
      ]
    }
  ],

  "reports": [
    {
      "_id": "r1",
      "title": "Monthly Attendance Report",
      "type": "attendance",
      "periodStart": "2026-04-01",
      "periodEnd": "2026-04-30",
      "createdBy": "u1"
    },
    {
      "_id": "r2",
      "title": "Exam Results Report",
      "type": "grades",
      "periodStart": "2026-01-01",
      "periodEnd": "2026-02-28",
      "createdBy": "u1"
    }
  ]
};

async function seed() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("Connected to MongoDB for custom seeding.");

    // Clear collections
    await User.deleteMany({});
    await Teacher.deleteMany({});
    await ClassModel.deleteMany({});
    await ModuleModel.deleteMany({});
    await Student.deleteMany({});
    await Exam.deleteMany({});
    await TimetableEntry.deleteMany({});
    await Attendance.deleteMany({});
    await Report.deleteMany({});
    await Demand.deleteMany({});
    console.log("Cleared existing data.");

    const idMap = {};
    const getObjectId = (oldId) => {
      if (!idMap[oldId]) {
        idMap[oldId] = new mongoose.Types.ObjectId();
      }
      return idMap[oldId];
    };

    const passwordHash = await User.hashPassword("school123");

    // 1. Users
    console.log("Seeding Users...");
    for (const u of data.users) {
      const newUser = new User({
        _id: getObjectId(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        passwordHash: passwordHash
      });
      await newUser.save();
    }

    // 2. Teachers
    console.log("Seeding Teachers...");
    for (const t of data.teachers) {
      const newTeacher = new Teacher({
        _id: getObjectId(t._id),
        user: getObjectId(t.user),
        teacherId: t.teacherId,
        department: t.department
      });
      await newTeacher.save();
    }

    // 3. Classes
    console.log("Seeding Classes...");
    for (const c of data.classes) {
      const newClass = new ClassModel({
        _id: getObjectId(c._id),
        name: c.name,
        level: c.level,
        academicYear: c.academicYear,
        homeroomTeacher: getObjectId(c.homeroomTeacher)
      });
      await newClass.save();
    }

    // 4. Students
    console.log("Seeding Students...");
    for (const s of data.students) {
      const newStudent = new Student({
        _id: getObjectId(s._id),
        user: getObjectId(s.user),
        studentId: s.studentId,
        class: getObjectId(s.class),
        dateOfBirth: new Date(s.dateOfBirth)
      });
      await newStudent.save();
    }

    // 5. Modules
    console.log("Seeding Modules...");
    for (const m of data.modules) {
      const newModule = new ModuleModel({
        _id: getObjectId(m._id),
        code: m.code,
        name: m.name,
        class: getObjectId(m.class),
        teacher: getObjectId(m.teacher)
      });
      await newModule.save();
    }

    // 6. Exams
    console.log("Seeding Exams...");
    for (const e of data.exams) {
      const newExam = new Exam({
        _id: getObjectId(e._id),
        title: e.title,
        module: getObjectId(e.module),
        class: getObjectId(e.class),
        date: new Date(e.date),
        createdBy: getObjectId(e.createdBy)
      });
      await newExam.save();
    }

    // 7. Timetable
    console.log("Seeding Timetable...");
    for (const tt of data.timetable) {
      const newEntry = new TimetableEntry({
        _id: getObjectId(tt._id),
        class: getObjectId(tt.class),
        module: getObjectId(tt.module),
        teacher: getObjectId(tt.teacher),
        dayOfWeek: tt.dayOfWeek,
        startTime: tt.startTime,
        endTime: tt.endTime
      });
      await newEntry.save();
    }

    // 8. Attendance
    console.log("Seeding Attendance...");
    for (const a of data.attendance) {
      const newAtt = new Attendance({
        _id: getObjectId(a._id),
        date: new Date(a.date),
        class: getObjectId(a.class),
        module: getObjectId(a.module),
        teacher: getObjectId(a.teacher),
        createdBy: getObjectId(a.createdBy),
        records: a.records.map(r => ({
          student: getObjectId(r.student),
          status: r.status.toLowerCase(), // Schema expects present, absent, late
          note: r.note || ""
        }))
      });
      await newAtt.save();
    }

    // 9. Reports
    console.log("Seeding Reports...");
    for (const r of data.reports) {
      const newReport = new Report({
        _id: getObjectId(r._id),
        title: r.title,
        type: r.type,
        periodStart: new Date(r.periodStart),
        periodEnd: new Date(r.periodEnd),
        createdBy: getObjectId(r.createdBy)
      });
      await newReport.save();
    }

    console.log("Custom seeding complete!");
    console.log("Default password for all users: school123");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
