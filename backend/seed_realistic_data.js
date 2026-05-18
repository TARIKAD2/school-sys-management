const mongoose = require("mongoose");
const { User } = require("./src/models/User");
const { Teacher } = require("./src/models/Teacher");
const { ClassModel } = require("./src/models/Class");
const { ModuleModel } = require("./src/models/Module");
const { Student } = require("./src/models/Student");
const { Exam } = require("./src/models/Exam");
const { Grade } = require("./src/models/Grade");
const { TimetableEntry } = require("./src/models/TimetableEntry");
const { Attendance } = require("./src/models/Attendance");
const { Demand } = require("./src/models/Demand");
const Lesson = require("./src/models/Lesson");
const Assignment = require("./src/models/Assignment");
const Submission = require("./src/models/Submission");
const Invoice = require("./src/models/Invoice");
const Payment = require("./src/models/Payment");
const Document = require("./src/models/Document");
const Event = require("./src/models/Event");
const Notification = require("./src/models/Notification");

const { env } = require("./src/utils/env");

async function seed() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("Connected to MongoDB for realistic seeding.");

    console.log("Clearing old data while keeping admin and secretary users...");
    await User.deleteMany({ role: { $nin: ["admin", "secretary"] } });
    await Teacher.deleteMany({});
    await ClassModel.deleteMany({});
    await ModuleModel.deleteMany({});
    await Student.deleteMany({});
    await Exam.deleteMany({});
    await Grade.deleteMany({});
    await TimetableEntry.deleteMany({});
    await Attendance.deleteMany({});
    await Lesson.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});
    await Invoice.deleteMany({});
    await Payment.deleteMany({});
    await Demand.deleteMany({});
    await Document.deleteMany({});
    await Event.deleteMany({});
    await Notification.deleteMany({});

    const adminUser = await User.findOne({ role: "admin" });
    const secretaryUser = await User.findOne({ role: "secretary" });
    const creatorId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();

    console.log("Seeding Classes...");
    const classNames = [
      "1BAC Science Math A", "1BAC Science Math B",
      "1BAC Science Experimental A", "1BAC Science Experimental B",
      "2BAC Physics A", "2BAC Physics B",
      "2BAC SVT A", "2BAC SVT B",
      "Tronc Commun Science A", "Tronc Commun Science B"
    ];
    let classes = [];
    for (const name of classNames) {
      let level = name.startsWith("1BAC") ? "1 BAC" : (name.startsWith("2BAC") ? "2 BAC" : "Tronc Commun");
      const newClass = new ClassModel({
        name: name,
        level: level,
        academicYear: "2025/2026"
      });
      classes.push(await newClass.save());
    }

    console.log("Seeding Teachers...");
    const teacherNames = [
      "Ahmed Benali", "Sara Nouri", "Youssef Karim", "Hassan Fassi", "Yasmine Alaoui",
      "Omar Idrissi", "Fatima Zahra Tazi", "Rachid Amrani", "Houda Chraibi", "Nabil Jaziri",
      "Karima Bennis", "Mohamed Saidi", "Salma Mouline", "Tarik Belkacem", "Imane Mansouri"
    ];
    const departments = ["Mathematics", "Physics & Chemistry", "SVT", "Languages", "Humanities"];

    let teachers = [];
    const passwordHash = await User.hashPassword("school123");

    for (let i = 0; i < 15; i++) {
        const tName = teacherNames[i];
        let tEmail = tName.toLowerCase().replace(" ", ".") + "@school.com";
        const tUser = new User({
            name: tName,
            email: tEmail,
            role: "teacher",
            isActive: true,
            passwordHash: passwordHash
        });
        await tUser.save();

        const newTeacher = new Teacher({
            user: tUser._id,
            teacherId: `T${100 + i}`,
            department: departments[i % departments.length],
            assignedClasses: []
        });
        teachers.push(await newTeacher.save());
    }

    console.log("Seeding Modules...");
    const moduleDefs = [
      { code: "MAT", name: "Mathematics" },
      { code: "PHY", name: "Physics & Chemistry" },
      { code: "SVT", name: "Life and Earth Sciences" },
      { code: "ISL", name: "Islamic Education" },
      { code: "ARB", name: "Arabic Language" },
      { code: "FRA", name: "French Language" },
      { code: "ENG", name: "English Language" },
      { code: "PHI", name: "Philosophy" },
      { code: "HIS", name: "History & Geography" },
      { code: "INF", name: "Computer Science" }
    ];

    let modules = [];
    for (let i = 0; i < 10; i++) {
        const modDef = moduleDefs[i];
        const assignedClass = classes[i];
        const assignedTeacher = teachers[i];
        
        const newModule = new ModuleModel({
            code: `${modDef.code}10${i}`,
            name: modDef.name,
            class: assignedClass._id,
            teacher: assignedTeacher._id
        });
        modules.push(await newModule.save());

        if(!assignedTeacher.assignedClasses.includes(assignedClass._id)){
            assignedTeacher.assignedClasses.push(assignedClass._id);
        }
        if(!assignedTeacher.assignedModules.includes(newModule._id)){
            assignedTeacher.assignedModules.push(newModule._id);
        }
        await assignedTeacher.save();
    }

    console.log("Seeding Students...");
    let students = [];
    let studentCounter = 1;
    for (let c = 0; c < classes.length; c++) {
        const cClass = classes[c];
        for (let s = 1; s <= 4; s++) {
            const sName = `Student ${studentCounter} (${cClass.name})`;
            let sEmail = `student${studentCounter}@school.com`;
            
            const sUser = new User({
                name: sName,
                email: sEmail,
                role: "student",
                isActive: true,
                passwordHash: passwordHash
            });
            await sUser.save();

            const newStudent = new Student({
                user: sUser._id,
                studentId: `ST${1000 + studentCounter}`,
                class: cClass._id,
                dateOfBirth: new Date("2008-05-15")
            });
            students.push(await newStudent.save());
            studentCounter++;
        }
    }

    console.log("Seeding TimetableEntries...");
    for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];
        const tt = new TimetableEntry({
            class: mod.class,
            module: mod._id,
            teacher: mod.teacher,
            dayOfWeek: (i % 5) + 1,
            startTime: "08:00",
            endTime: "10:00",
            room: `Room ${100 + i}`
        });
        await tt.save();
    }

    console.log("Seeding Lessons, Exams, Assignments...");
    let lessons = [];
    let exams = [];
    let assignments = [];
    for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];
        
        const les = new Lesson({
            module: mod._id,
            title: `Introduction to ${mod.name}`,
            content: `This is the first lesson covering the basics of ${mod.name}.`,
            fileType: "pdf",
            createdBy: mod.teacher
        });
        lessons.push(await les.save());

        const exm = new Exam({
            title: `${mod.name} Midterm`,
            module: mod._id,
            class: mod.class,
            date: new Date(Date.now() + 86400000 * 7),
            createdBy: mod.teacher || creatorId
        });
        exams.push(await exm.save());

        const asn = new Assignment({
            module: mod._id,
            title: `${mod.name} Homework 1`,
            instructions: `Please complete exercises 1 to 5.`,
            deadline: new Date(Date.now() + 86400000 * 3),
            points: 100,
            createdBy: mod.teacher || creatorId
        });
        assignments.push(await asn.save());
    }

    console.log("Seeding Grades, Submissions...");
    for (let i = 0; i < exams.length; i++) {
        const exm = exams[i];
        const classStudents = students.filter(s => s.class.toString() === exm.class.toString());
        for (const stu of classStudents) {
            const gr = new Grade({
                student: stu._id,
                exam: exm._id,
                score: Math.floor(Math.random() * 20) + 80,
                comment: "Good job",
                createdBy: exm.createdBy
            });
            await gr.save();
        }
    }

    for (let i = 0; i < assignments.length; i++) {
        const asn = assignments[i];
        const mod = modules.find(m => m._id.toString() === asn.module.toString());
        const classStudents = students.filter(s => s.class.toString() === mod.class.toString());
        for (const stu of classStudents) {
             const sub = new Submission({
                 assignment: asn._id,
                 student: stu._id,
                 content: "Here is my homework.",
                 fileUrl: "homework.pdf",
                 status: "submitted"
             });
             try { await sub.save(); } catch(e){}
        }
    }

    console.log("Seeding Attendance...");
    for (let c = 0; c < classes.length; c++) {
        const cClass = classes[c];
        const classStudents = students.filter(s => s.class.toString() === cClass._id.toString());
        const mod = modules.find(m => m.class.toString() === cClass._id.toString());
        if (mod) {
          const att = new Attendance({
              date: new Date(),
              class: cClass._id,
              module: mod._id, // Add module per schema constraints
              createdBy: creatorId,
              records: classStudents.map((s, idx) => ({
                  student: s._id,
                  status: idx === 0 ? "absent" : "present"
              }))
          });
          try { await att.save(); } catch(e){}
        }
    }

    console.log("Seeding Invoices and Payments...");
    for (let s = 0; s < students.length; s++) {
        const stu = students[s];
        const inv = new Invoice({
            student: stu._id,
            title: "Term 1 Fees",
            amount: 5000,
            dueDate: new Date(Date.now() + 86400000 * 30),
            items: [
                { description: "Tuition", price: 4500 },
                { description: "Registration", price: 500 }
            ],
            status: "pending",
            createdBy: creatorId
        });
        await inv.save();

        if (s % 2 === 0) {
            const pay = new Payment({
                invoice: inv._id,
                student: stu._id,
                amount: 5000,
                method: "cash",
                createdBy: creatorId
            });
            await pay.save();
            inv.status = "paid";
            inv.paidAmount = 5000;
            await inv.save();
        }
    }

    console.log("Seeding Demands...");
    if (secretaryUser) {
        const dem = new Demand({
            student: students[0]._id,
            recipientType: "student",
            secretary: secretaryUser._id,
            message: "Please submit your medical certificate.",
            status: "pending"
        });
        await dem.save();

        const demT = new Demand({
            teacher: teachers[0]._id,
            recipientType: "teacher",
            secretary: secretaryUser._id,
            message: "Meeting at 10 AM.",
            status: "pending"
        });
        await demT.save();
    }

    console.log("Seeding Documents...");
    const doc = new Document({
        title: "School Rules 2026",
        description: "Rules for 2026.",
        fileUrl: "rules.pdf",
        fileType: "application/pdf",
        createdBy: creatorId
    });
    try { await doc.save(); } catch(e) { console.log(e.message); }

    console.log("Seeding Events...");
    const evt = new Event({
        title: "End of Term Celebration",
        startDate: new Date(Date.now() + 86400000 * 15),
        type: "other",
        targetRoles: ["student", "teacher"],
        createdBy: creatorId
    });
    await evt.save();

    console.log("Seeding Notifications...");
    const notif = new Notification({
        recipient: students[0].user,
        title: "Welcome!",
        message: "Welcome to the new academic year.",
        type: "info"
    });
    await notif.save();

    console.log("Realistic seeding complete!");
    console.log("Default password for all mocked users: school123");
    process.exit(0);

  } catch (err) {
    console.error("Realistic Seeding error:", err);
    process.exit(1);
  }
}

seed();
