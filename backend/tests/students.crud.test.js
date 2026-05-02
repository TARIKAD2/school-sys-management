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

describe("Students CRUD + RBAC", () => {
  let adminToken;
  let teacherToken;

  beforeAll(async () => {
    await startInMemoryMongo();
    await createUser({ name: "Admin", email: "admin@test.com", password: "admin123", role: "admin" });
    await createUser({ name: "Teacher", email: "teacher@test.com", password: "teacher123", role: "teacher" });
    adminToken = await loginAs({ email: "admin@test.com", password: "admin123", role: "admin" });
    teacherToken = await loginAs({ email: "teacher@test.com", password: "teacher123", role: "teacher" });
  });

  afterAll(async () => {
    await stopInMemoryMongo();
  });

  test("teacher cannot create student (403)", async () => {
    const res = await request(app)
      .post("/api/students")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send({ name: "S1", email: "s1@test.com", password: "student123", studentId: "S-001" });
    expect(res.status).toBe(403);
  });

  test("admin can create, list (search/pagination), update, delete student", async () => {
    // Create
    const createRes = await request(app)
      .post("/api/students")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Student One", email: "s1@test.com", password: "student123", studentId: "S-001" });
    expect(createRes.status).toBe(201);
    const id = createRes.body.student._id;

    // List + search + pagination
    const listRes = await request(app)
      .get("/api/students?page=1&limit=10&q=Student&sort=name")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.total).toBe(1);
    expect(listRes.body.items[0].studentId).toBe("S-001");

    // Update (and disable user)
    const updRes = await request(app)
      .put(`/api/students/${id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ studentId: "S-002", isActive: false });
    expect(updRes.status).toBe(200);
    expect(updRes.body.student.studentId).toBe("S-002");

    // Delete
    const delRes = await request(app)
      .delete(`/api/students/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(delRes.status).toBe(200);

    // Empty state
    const emptyRes = await request(app).get("/api/students").set("Authorization", `Bearer ${adminToken}`);
    expect(emptyRes.status).toBe(200);
    expect(emptyRes.body.total).toBe(0);
  });
});

