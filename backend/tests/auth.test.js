// Ensure env validation passes at import time
process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/psms_test_placeholder";
process.env.JWT_SECRET = process.env.JWT_SECRET || "THIS_IS_A_TEST_SECRET_32_CHARS_MINIMUM";
process.env.PORT = process.env.PORT || "5001";
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../src/app");
const { startInMemoryMongo, stopInMemoryMongo, createUser } = require("./_helpers");

describe("Auth", () => {
  beforeAll(async () => {
    await startInMemoryMongo();
    await createUser({
      name: "Admin",
      email: "admin@test.com",
      password: "admin123",
      role: "admin",
    });
  });

  afterAll(async () => {
    await stopInMemoryMongo();
  });

  test("login works and returns token + user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "admin123",
      role: "admin",
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe("admin@test.com");
    expect(res.body.user.role).toBe("admin");
  });

  test("protected route requires JWT", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });
});

