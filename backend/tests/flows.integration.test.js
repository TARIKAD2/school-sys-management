process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/psms_test_placeholder";
process.env.JWT_SECRET = process.env.JWT_SECRET || "THIS_IS_A_TEST_SECRET_32_CHARS_MINIMUM";
process.env.PORT = process.env.PORT || "5001";
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../src/app");
const { startInMemoryMongo, stopInMemoryMongo, createUser } = require("./_helpers");

async function loginAs({ email, password, role }) {
  const res = await request(app).post("/api/auth/login").send({ email, password, role });
  return res.body.token;
}

describe("Core cross-role flows", () => {
  let adminToken;
  let teacherToken;
  let studentToken;

  let teacherProfileId;
  let classId;
  let moduleId;
  let studentProfileId;
  let examId;
  let attendanceId;

  beforeAll(async () => {
    await startInMemoryMongo();
    await createUser({ name: "Admin", email: "admin@test.com", password: "admin123", role: "admin" });
    adminToken = await loginAs({ email: "admin@test.com", password: "admin123", role: "admin" });
  });

  afterAll(async () => {
    await stopInMemoryMongo();
  });

  test("admin builds core academic structure", async () => {
    const teacherRes = await request(app)
      .post("/api/teachers")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Teacher One",
        email: "teacher1@test.com",
        password: "teacher123",
        teacherId: "T-001",
        department: "Science",
      });
    expect(teacherRes.status).toBe(201);
    teacherProfileId = teacherRes.body.teacher._id;

    const classRes = await request(app)
      .post("/api/classes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Class A", level: "Grade 10", academicYear: "2026/2027", homeroomTeacherId: teacherProfileId });
    expect(classRes.status).toBe(201);
    classId = classRes.body.item._id;

    const moduleRes = await request(app)
      .post("/api/modules")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ code: "MATH101", name: "Mathematics", classId, teacherId: teacherProfileId });
    expect(moduleRes.status).toBe(201);
    moduleId = moduleRes.body.item._id;

    const studentRes = await request(app)
      .post("/api/students")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Student One",
        email: "student1@test.com",
        password: "student123",
        studentId: "S-100",
        classId,
      });
    expect(studentRes.status).toBe(201);
    studentProfileId = studentRes.body.student._id;

    const timetableRes = await request(app)
      .post("/api/timetable")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        classId,
        moduleId,
        teacherId: teacherProfileId,
        dayOfWeek: 1,
        startTime: "08:00",
        endTime: "09:00",
        room: "R1",
      });
    expect(timetableRes.status).toBe(201);
  });

  test("teacher creates exam, attendance, and grade", async () => {
    teacherToken = await loginAs({ email: "teacher1@test.com", password: "teacher123", role: "teacher" });
    studentToken = await loginAs({ email: "student1@test.com", password: "student123", role: "student" });

    const examRes = await request(app)
      .post("/api/exams")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({
        title: "Math Midterm",
        moduleId,
        classId,
        date: "2026-06-10T09:00:00.000Z",
      });
    expect(examRes.status).toBe(201);
    examId = examRes.body.item._id;

    const attendanceRes = await request(app)
      .post("/api/attendance")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({
        date: "2026-05-01T08:00:00.000Z",
        classId,
        moduleId,
        teacherId: teacherProfileId,
      });
    expect(attendanceRes.status).toBe(201);
    attendanceId = attendanceRes.body.item._id;

    const recordsRes = await request(app)
      .put(`/api/attendance/${attendanceId}/records`)
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({
        records: [{ studentId: studentProfileId, status: "absent", note: "Sick leave" }],
      });
    expect(recordsRes.status).toBe(200);

    const gradeRes = await request(app)
      .post("/api/grades")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({
        studentId: studentProfileId,
        examId,
        score: 88,
        comment: "Good work",
      });
    expect(gradeRes.status).toBe(201);
  });

  test("student sees filtered timetable/exams/grades and admin reports are protected", async () => {
    const ttRes = await request(app).get("/api/timetable").set("Authorization", `Bearer ${studentToken}`);
    expect(ttRes.status).toBe(200);
    expect(ttRes.body.total).toBe(1);

    const examsRes = await request(app).get("/api/exams").set("Authorization", `Bearer ${studentToken}`);
    expect(examsRes.status).toBe(200);
    expect(examsRes.body.total).toBe(1);

    const gradesRes = await request(app).get("/api/grades").set("Authorization", `Bearer ${studentToken}`);
    expect(gradesRes.status).toBe(200);
    expect(gradesRes.body.total).toBe(1);
    expect(gradesRes.body.items[0].score).toBe(88);

    const studentReportCreate = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ title: "Forbidden report" });
    expect(studentReportCreate.status).toBe(403);

    const reportCreate = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Monthly Attendance Report",
        type: "attendance",
        periodStart: "2026-05-01",
        periodEnd: "2026-05-31",
        summary: "Attendance stable.",
      });
    expect(reportCreate.status).toBe(201);

    const reportList = await request(app).get("/api/reports").set("Authorization", `Bearer ${adminToken}`);
    expect(reportList.status).toBe(200);
    expect(reportList.body.total).toBe(1);
  });
});

