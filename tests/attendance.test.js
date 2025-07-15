const request = require("supertest");
const app = require("../index");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const mongoose = require("mongoose");

let employeeToken;

beforeAll(async () => {
  await User.deleteMany({ email: "employee@test.com" });
  await Attendance.deleteMany({});

  // Create employee
  await request(app).post("/api/auth/register").send({
    name: "Employee User",
    email: "employee@test.com",
    password: "employeepass",
    role: "employee"
  });

  // Login employee
  const empLogin = await request(app).post("/api/auth/login").send({
    email: "employee@test.com",
    password: "employeepass"
  });
  employeeToken = empLogin.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: "employee@test.com" });
  await Attendance.deleteMany({});
  await mongoose.disconnect();
});

describe("Attendance API", () => {
  test("Employee can check in", async () => {
    const res = await request(app)
      .post("/api/attendance/checkin")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({});

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("present");
  });

  test("Employee can check out", async () => {
    const res = await request(app)
      .put("/api/attendance/checkout")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.check_out_time).toBeDefined();
    expect(res.body.total_hours).toBeDefined();
  });

  test("Employee can get their attendance records", async () => {
    const res = await request(app)
      .get("/api/attendance")
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});
